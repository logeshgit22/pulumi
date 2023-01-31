"use strict";
const pulumi = require("@pulumi/pulumi");
const aws = require("@pulumi/aws");

const command1 = require("@pulumi/command");
const tls = require("@pulumi/tls");


let size = "t2.micro" ;

const ubuntu =  aws.ec2.getAmi({
    mostRecent: true,
    filters: [
        {
            name: "name",
            values: ["ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"],
        },
        {
            name: "virtualization-type",
            values: ["hvm"],
        },
    ],
    owners: ["099720109477"],
});



const ssh_key = new  tls.PrivateKey("generated",
    {
    algorithm :"RSA",
    rsa_bits : 4096,
    crkey : "publicKeyOpenssh",
     });


const aws_key = new  aws.ec2.KeyPair("generated",
    {
    keyName : "keytt",
    publicKey : ssh_key.publicKeyOpenssh,

});

let group = new aws.ec2.SecurityGroup("testk8",{
 	ingress: [
 		{protocol: "all", fromPort: "", toPort: "", cidrBlocks: ["0.0.0.0/0"]}],
 egress:[

            {protocol: "All",
            fromPort: "",
            toPort:"",
            cidrBlocks: ["0.0.0.0/0"]},
             ],});

let userData = `#!/bin/bash
sudo apt-get update
sudo apt install -y zip
cd /home/ubuntu ; sudo unzip kl.zip
cd /home/ubuntu ; sudo rm -rf kl.zip`;



let server = new aws.ec2.Instance("test-k8install",{
	instanceType: size,
	 ami: ubuntu.then(ubuntu => ubuntu.id),
        vpcSecurityGroupIds: [ group.id ],
        keyName:aws_key.keyName,
        userData: userData,
           
       
});

var connect = {
    host: server.publicIp,
    privateKey: ssh_key.privateKeyPem,
    user: "ubuntu",
};


const sizeFile = new command1.remote.CopyFile("find", {
    connection: connect,
    localPath: "/home/logeshwaran/kl.zip",
    remotePath: "/home/ubuntu/kl.zip"});



exports.publicIp = server.publicIP;
exports.publiHostName = server.publicDns;
exports.privateKeyPem = ssh_key.privateKeyPem;

