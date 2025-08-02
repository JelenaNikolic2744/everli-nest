## Text of the task
Create a REST api that handles witness reports. 
API clients send a name of a person of interest or a part of the case title, and a phone 
number so they can be contacted for more details. 
We need to store all of the witness reports in a file, and we should check the validity of the report. 

Requirements: 
a) Check if there actually is a case that matches in the FBI DB. You can use the open FBI Most Wanted API: https://www.fbi.gov/wanted/api
b) Check the validity of the phone number 
c) Check and record the country of the client. This can be deducted from their phone number and/or ip address

## Instructions
- use command npm i - to install all dependencies
- npm start to start the app

## cURL for Postman:
curl --location 'localhost:3000/witness-report' \
--header 'Content-Type: application/json' \
--data '{
 "personOrCase":"CELESTE", "phone":"+12513159160"
}
'