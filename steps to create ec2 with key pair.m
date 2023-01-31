mkdir name && cd name

pulumi new aws-javascript 

pulumi up

pulumi stack output privateKeyPem --show-secrets >> name.pem

chmod 400 name.pem

ssh -i name.pem username@host


