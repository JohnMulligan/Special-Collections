import requests
url_auth="http://localhost:5000/auth"
data={"userName":"example","password":"123456"}
resp_auth=requests.post(url_auth,data=data)
print(resp_auth.text)