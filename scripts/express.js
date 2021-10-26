const path = require("path");
const replaceall = require("replaceall");
const express = require("express");
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');
const app = express(); // create express app
const bcrypt = require('bcrypt'); // allow checking passwords securely
const jwt = require('jsonwebtoken'); // generates JWTs.
const generator = require('generate-password'); // used to generate initial/reset passwords.
// CSV used to parse user info.
const csv = require('csv-parser');
const fs = require('fs');
const usersDataFile = '.users.csv';
let users = {};

if (process.env.NODE_ENV !== 'production') {
  // Allow an .env file in development to store local Omeka access keys.
  require('dotenv').config();
}

const omekaProtocol = process.env.OMEKA_PROTOCOL || 'http';
const omekaUrl = process.env.OMEKA_URL || 'localhost';
const port = process.env.SERVER_PORT || 3000;
const baseUrl = `${process.env.BASE_URL || 'localhost'}:${port}`;

// This approach was found in the GitHub post:
// https://github.com/chimurai/http-proxy-middleware/issues/293#issuecomment-449548863
const updateQueryStringParameter = (path, key, value) => {
  const re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
  const separator = path.indexOf('?') !== -1 ? '&' : '?';
  if (path.match(re)) {
    return path.replace(re, '$1' + key + '=' + value + '$2');
  } else {
    return path + separator + key + '=' + value;
  }
};

const jwtNoToken = { auth: false, message: 'No token provided.' };
const jwtFailure = { auth: false, message: 'Failed to authenticate token.' };

const verifyJWT = (req, res, next) => {
  const tokenHeader = 'x-access-token';
  const token = req.headers[tokenHeader];
  if (!token) return res.status(401).json(jwtNoToken);
  jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
    if (err) return res.status(500).json(jwtFailure);
    // Include the user in the request.
    req.user = users[decoded.userName];
    if (!req.user) return res.status(500).json(jwtFailure);
    // Delete headers that are not needed further in the chain.
    delete req.headers[tokenHeader];
    delete req.headers['cookie']
    next();
  });
};

const readOnlyOmeka = (req, res, next) => {
  if (req.method === 'GET') {
    req.user = { role: 'guest' };
    return next();
  }
}; 

const baseProxyConfig = {
  target: `${omekaProtocol}://${omekaUrl}`,
  changeOrigin: true,
  pathRewrite: (path, req) => {
    let newPath = path;
    if (req.user) {
      const role = req.user.role.toUpperCase();
      newPath = updateQueryStringParameter(newPath, 'key_identity', process.env[`OMEKA_${role}_ID`]);
      newPath = updateQueryStringParameter(newPath, 'key_credential', process.env[`OMEKA_${role}_CREDENTIAL`]);
    }
    return newPath;
  }
};

const apiUrlReplace = replaceall("/","\\\/",omekaUrl);

const apiProxyConfig = {
  ...baseProxyConfig,
  selfHandleResponse: true,
  onProxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
    // Omeka S includes its own URL in several parts of the response.
    // Here we replace all occurrances it by our proxy URL.
    // TODO: check if there is a configuration option in Omeka S to
    // disable the base url from being exported in the response.
    const response = responseBuffer.toString('utf8');
    //console.log(response.code);
    //console.log("replace this:",baseUrl);
    //console.log("with this:",apiUrlReplace);
    const x = replaceall(apiUrlReplace,baseUrl,response);
    
    //console.log(x);
   //	 console.log(apiUrlRegex);
    //const x = replaceall("10.134.196.127\\\/omeka",baseUrl,response);

    return x;
  //  console.log(response.replace(apiUrlRegex, baseUrl));
//    return response.replace(apiUrlRegex, baseUrl);
    
  })
};

const roles = ['admin', 'contrib', 'guest'];

const updateUsers = async (next) => {
  // Persist to users CSV file before updating our local cache.
  let data = 'userName,role,hash\n';
  for (const u of Object.values(next)) {
    data += `"${u.userName}",${u.role},${u.hash}\n`;
  }
  await fs.promises.writeFile(usersDataFile, data);
  // At this point we can update the users.
  users = next;
};

const hashPassword = async (password) => await bcrypt.hash(password, 10);

// Creates or updates a user setting a randomly generated
// password and return an object with the user info,
// including the plain text password (that needs to be
// changed).
const createOrUpdateUser = async (userName, role) => {
  const password = generator.generate({
    length: 10,
    numbers: true
  });
  const hash = await hashPassword(password);
  await updateUsers({
    ...users,
    [userName]: {
      userName,
      role,
      hash
    }
  });
  return { userName, role, password };
};

const isUserNameValid = (s) => s.match(/^([0-9]|[a-z]|_|-|@|\.)+$/);

// Handlers for request entrypoints.

// Proxy for Omeka S:
app.use('/api', verifyJWT, createProxyMiddleware(apiProxyConfig));
app.patch('/api', verifyJWT, createProxyMiddleware(apiProxyConfig));
const omekaStaticProxy = createProxyMiddleware(baseProxyConfig);
app.use('/files', readOnlyOmeka, omekaStaticProxy);
app.use('/application', readOnlyOmeka, omekaStaticProxy);

app.post('/adduser', verifyJWT, express.json(), async (req, res) => {
  if (req.user?.role !== 'admin') return res.status(401).json(jwtFailure);
  // We got an admin user logged asking for a new user to be created!
  const { userName, role } = req.body;
  if (userName && role) {
    if (!isUserNameValid(userName)) {
      return res.status(400).json({ error: 'Invalid character in userName' });
    }
    if (roles.indexOf(role) < 0) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    if (users[userName]) {
      return res.status(400).json({ error: 'userName already taken' });
    }
    // We are free to create a new user.
    return res.json(await createOrUpdateUser(userName, role));
  } else {
    return res.status(400).json({ error: 'Must specify userName and role' });
  }
});

app.post('/resetpassword', verifyJWT, express.json(), async (req, res) => {
  if (req.user?.role !== 'admin') return res.status(401).json(jwtFailure);
  // We got an admin user logged asking for a new user to be created!
  const { userName } = req.body;
  // The user must exist.
  const user = users[userName];
  if (user) {
    return res.json(await createOrUpdateUser(userName, user.role));
  } else {
    return res.status(400).json({ error: 'userName not found' });
  }
});

app.post('/changerole', verifyJWT, express.json(), async (req, res) => {
  if (req.user?.role !== 'admin') return res.status(401).json(jwtFailure);
  // We got an admin user logged asking for a new user to be created!
  const { userName, role } = req.body;
  if (userName && role) {
    if (roles.indexOf(role) < 0) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const user = users[userName];
    if (!user) {
      return res.status(400).json({ error: 'userName not found' });
    }
    // now modify the role of the user.
    await updateUsers({
      ...users,
      [userName]: { ...user, role }
    });
    return res.json({ result: 'Role updated' });
  } else {
    return res.status(400).json({ error: 'Must specify userName and role' });
  }
});

app.post('/changepassword', verifyJWT, express.json(), async (req, res) => {
  if (!req.user) return res.status(401).json(jwtFailure);
  const { password } = req.body;
  // TODO: password strength.
  if (password && password.length >= 6) {
    const hash = await hashPassword(password);
    const changedUser = { ...req.user, hash };
    await updateUsers({
      ...users,
      [changedUser.userName]: changedUser
    });
    return res.json({ result: 'Password changed' });
  } else {
    return res.status(400).json({ error: 'Weak password' });
  }
});

// Login.
app.post('/auth', express.json(), async (req, res) => {
  console.log(req.body)
  const { userName, password } = req.body;
  
  let ok = false;
  if (userName && password) {
    const u = users[userName];
    if (u && u.hash) {
      ok = await bcrypt.compare(password, u.hash);
    }
  }
  if (!ok) return res.json({ auth: false });
  // Generate JWT for this login.
  const token = jwt.sign({ userName }, process.env.JWT_SECRET, {
    expiresIn: parseInt(process.env.JWT_EXPIRATION_HOURS || 24) * 60 * 60
  });
  return res.json({ auth: true, token });
});

// Map React urls to the React App.
app.use('/react', [
  function (req, res, next) {
    req.url = req.url.replace('/react/', '/');
    //theregottobeabetterway.gif
    next();
  }, express.static(path.join(__dirname, "..", "build"))]);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '/build/index.html'));
});

app.listen(port, () => {
  fs.createReadStream(usersDataFile)
    .pipe(csv())
    .on('data', (row) => {
      users[row.userName] = row;
    })
    .on('end', () => {
      console.log(`Server started on port ${port} - ${Object.keys(users).length} users`);
    });
});
