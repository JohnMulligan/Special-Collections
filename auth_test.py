import requests
import json
import sys

username=sys.argv[1]
password=sys.argv[2]

base_url="localhost:5000"

def auth(base_url,username,pw):
	url_auth= "http://" + base_url + "/auth"
	headers={'content-type':"application/json"}
	data_auth={"userName":username,"password":pw}
	resp_auth=requests.post(
		url_auth,
		headers=headers,
		data=json.dumps(data_auth))
	j=json.loads(resp_auth.text)
	print(j)
	token=j['token']
	print(token)
	return(token)

def adduser(base_url,token,username):
	url_adduser= "http://" + base_url + "/adduser"
	headers = {
		'content-type':"application/json",
		'x-access-token':token
		}
	data_adduser={"userName":username,"role":"admin"}
	print(headers)
	resp_adduser=requests.post(
		url_adduser,
		headers=headers,
		data=json.dumps(data_adduser))
	j=json.loads(resp_adduser.text)
	print(j)
	temp_password=j['password']
	return(temp_password)

def changepw(base_url,token,new_password):
	url_changepw= "http://" + base_url + "/changepassword"
	headers = {
		'content-type':"application/json",
		'x-access-token':token
		}
	data_changepw={"password":new_password}
	resp_changepw=requests.post(
		url_changepw,
		headers=headers,
		data=json.dumps(data_changepw))
	j=json.loads(resp_changepw.text)
	print(j)


#this script creates an admin user with a password
#not the best--depends on the instance being run unsecurely on localhost port 5000
#and with this starter user, "example" "123456" existing in the sheet to authorize the first request
#usage looks like: python auth_test.py user2 password2



token=auth(base_url,"example","123456")

temp_password=adduser(base_url,token,username)

token=auth(base_url,username,temp_password)

changepw(base_url,token,password)

