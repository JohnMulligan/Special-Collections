![special collections tabular](https://github.com/JohnMulligan/Special-Collections/blob/master/screenshots/tabular.png?raw=true)


# Documentation

This repository contains the code for the Special Collections app, which
consists of a server component, using express.js and a front-end web app using
React.

Omeka S is used as the data store and the app can be configured to use any
instance, locally or remotely.

This document gives you a quick setup guide. For fuller documentation, see documentation.md in this directory

# Present & Future

We are currently evaluating this application and are likely to be updating it in 2022. Please contact the repository maintainers with any questions or suggestions.

That also means that it requires further documentation on its use. For now, one important note: This application relies _heavily_ on the Omeka-S Resource Templating functionality. You should:

* Define one template per class, and one class per template
* Name every field you'll be using for a given class in the template
* Define the data type as "resource" "text" "numeric"

# Omeka-S requirements

* IIIF Server: https://omeka.org/s/modules/IiifServer/
* Image Server: https://omeka.org/s/modules/ImageServer/
* Numeric Data Types (very useful but not strictly necessary): https://omeka.org/s/modules/NumericDataTypes/

# Quick Setup

## Install npm

I recommend using nvm

```
	sudo git clone https://github.com/nvm-sh/nvm 
	cd nvm
	sudo sh install.sh
	export NVM_DIR="$HOME/.nvm"
	[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
	nvm
	nvm install 14.0.0
	nvm use 14.0.0
```

## Install & build the app

```
	git clone https://github.com/JohnMulligan/Special-Collections/

	cd Special-Collections
	
	sudo npm install
	
	sudo npm run build
```

## Add in extra UV files (included)

The Universal Viewer requires the files currently in uv.tgz to be placed in the build directory, so:

```
	tar -xzvf uv.tgz
	mv uv/* build/
```

## Set up environment variables

First, copy the example files over:

```
	cp .env.example .env
	cp .users.csv.example .users.csv
```

Second, get your api keys from your Omeka-S server and plug them into the .env file.

Third, fill in the address of your server.

Fourth, you may have some CORS debugging ahead of you (apologies!). We have some suggestions in "example.conf"

## Create admin user(s)

Make a new user with ```python create_admin.py USERNAME PASSWORD```

Then consider deleting the line with the 'example' user from your .users.csv file

## Run your server (dev mode)

Now you can run your server in dev mode

```
	npm install pm2
	pm2 start scripts/express.js
```

Kill this with ```pm2 kill```

## Log in

Navigate to HOSTNAME:5000, and use your new username and password to access the interface.

