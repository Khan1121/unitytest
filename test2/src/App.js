import React from 'react';
import ScatterJS from 'scatterjs-core';
import ScatterEOS from 'scatterjs-plugin-eosjs';
import Eos from 'eosjs';
import './App.css';
import Unity, { UnityContent } from "react-unity-webgl";

// 스캐터 사용하기 위해 객체 생성 및 옵션 설정
ScatterJS.plugins( new ScatterEOS() );
const network = {
    blockchain:'eos',
    protocol:'https',
    host:'jungle2.cryptolions.io',
    port:443,
    chainId:'e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473'
}

const testnetserver = 'http://3.1.78.155/'

// 유니티 객체를 전역으로 설정
let unityContent = new UnityContent(
    "http://192.168.219.119:3000/Build/UnlimitedTower.json",
    "http://192.168.219.119:3000/Build/UnityLoader.js",
    {
        adjustOnWindowResize: true
    }
  ); 
  
class App extends React.Component {
    
    constructor(props){
        super(props);

        // 유니티에서 실행 된 함수를 unityContent 객체로 받아서 실행
        unityContent.on("SignUp", function(){
            ScatterJS.scatter.connect('My-App').then(connected => {
                if(!connected) return false;
                const scatter = ScatterJS.scatter;
                const requiredFields = { accounts:[network] };
                scatter.getIdentity(requiredFields).then(() => {
                    const account = scatter.identity.accounts.find(x => x.blockchain === 'eos');
                    const eosOptions = { expireInSeconds:60 };
                    const eos = scatter.eos(network, Eos, eosOptions);
                    /*
                    eos.transaction({
                        actions:[
                            {
                                account : 'unlimitedmas',
                                name : 'signup',
                                authorization:[{
                                    actor : account.name,
                                    permission : account.authority
                                }],
                                data : {
                                    _user : account.name
                                }
                            }                  
                        ]
                    });  */


                    eos.transfer(account.name, 'unlimitedmas', '1.0000 EOS', 'signup').then(trx => {
                        console.log(`Transaction ID: ${trx.transaction_id}`);
                    }).catch(error => {
                        console.error(error);
                    });
                    

                    const request = require('superagent');
                    const url=testnetserver+'signup';
                    request.post(url)
                        .set('Content-Type', 'application/json')
                        .send({user : account.name})
                        .then(result=>{
                        const data = JSON.stringify(result.body);
                        console.log(result.body);
                        unityContent.send("PacketManager", "ResponseLogin", data);
                        
                    }).catch(error=>{
                        console.error(error);
                    });
                });
            });
        });

        unityContent.on("Gacha", function(){
            ScatterJS.scatter.connect('My-App').then(connected => {
                if(!connected) return false;
                const scatter = ScatterJS.scatter;
                const requiredFields = { accounts:[network] };
                scatter.getIdentity(requiredFields).then(() => {
                    const account = scatter.identity.accounts.find(x => x.blockchain === 'eos');
                    const eosOptions = { expireInSeconds:60 };
                    const eos = scatter.eos(network, Eos, eosOptions);
                    
                    const transactionOptions = { authorization:[`${account.name}@${account.authority}`] };

                    // POST Request
                    const request = require('superagent');
                    const url=testnetserver+'seed';
                    request.post(url)
                        .set('Content-Type', 'application/json')
                        .send({user : account.name})
                        .then(result=>{
                            console.log(result.body.seed);
                            console.log(result.body.num);
                            eos.transfer(account.name, 'unlimitedmas', '1.0000 EOS', 'gacha:'+result.body.num+':'+result.body.seed, transactionOptions).then(trx => {
                                console.log(`Transaction ID: ${trx.transaction_id}`);
                            }).catch(error => {
                                console.error(error);
                            });
                    }).catch(error=>{
                        console.error(error);
                    });
                    //
                    // POST Request
                    const gachaurl=testnetserver+'gacha';
                    request.post(gachaurl)
                        .set('Content-Type', 'application/json')
                        .send({user : account.name})
                        .then(result=>{
                            const data = JSON.stringify(result.body);
                            unityContent.send("PacketManager", "ResponseGacha", data);
                            console.log(data);
                    }).catch(error=>{
                        console.error(error);
                    });
                    // 
                }).catch(error => {
                    console.error(error);
                });   
            });
        });

        unityContent.on("Login", function(){
            ScatterJS.scatter.connect('My-App').then(connected => {
                if(!connected) return false;
                const scatter = ScatterJS.scatter;
                const requiredFields = { accounts:[network] };
                scatter.getIdentity(requiredFields).then(() => {
                    const account = scatter.identity.accounts.find(x => x.blockchain === 'eos');
                    const eosOptions = { expireInSeconds:60 };
                    const eos = scatter.eos(network, Eos, eosOptions);

                    // POST Request
                    const request = require('superagent');
                    const url=testnetserver+'login';
                    request.post(url)
                        .set('Content-Type', 'application/json')
                        .send({user : account.name})
                        .then(result=>{
                        console.log(result.body);
                        if(result.body.signup == null)
                        {
                            eos.transfer(account.name, 'unlimitedmas', '1.0000 EOS', 'signup').then(trx => {
                                console.log(`Transaction ID: ${trx.transaction_id}`);
                            }).catch(error => {
                                console.error(error);
                            });
                            const url=testnetserver+'signup';
                            request.post(url)
                                 .set('Content-Type', 'application/json')
                                 .send({user : account.name})
                                 .then(result=>{
                                 const data = JSON.stringify(result.body);
                                 console.log(result.body);
                                 unityContent.send("PacketManager", "ResponseLogin", data);
                        
                    }).catch(error=>{
                        console.error(error);
                    });
                        }
                        else
                        {
                            var u_data = {
                                servant_list : result.body.servant_list,
                                monster_list : result.body.monster_list,
                                item_list : result.body.monster_list,
                                token : result.body.token,
                                party_info : result.body.party_info,
                                userinfo : result.body.user_info

                            }
                            const data = JSON.stringify(u_data);
                        unityContent.send("PacketManager", "ResponseLogin", data);
                        }
                    }).catch(error=>{
                        console.error(error);
                    });
                    // 
                }).catch(error => {
                    console.error(error);
                });   
            });
        });

        unityContent.on("SetFormation", data => {
            ScatterJS.scatter.connect('My-App').then(connected => {
                if(!connected) return false;
                const scatter = ScatterJS.scatter;
                const requiredFields = { accounts:[network] };
                scatter.getIdentity(requiredFields).then(() => {
                    const account = scatter.identity.accounts.find(x => x.blockchain === 'eos');
                    const eosOptions = { expireInSeconds:60 };
                    const eos = scatter.eos(network, Eos, eosOptions);
                  
                    const value = JSON.parse(data);
                    eos.transaction({
                        actions:[
                            {
                                account : 'unlimitedmas',
                                name : 'setparty',
                                authorization:[{
                                    actor : account.name,
                                    permission : account.authority
                                }],
                                data : {
                                    _user : account.name,
                                    _party_number : value.partyNum,
                                    _servant_list : value.servantList,
                                    _monster_list : value.monsterList
                                }
                            }
                        ]
                    });  
                    // POST Request
                    const request = require('superagent');
                    const url=testnetserver+'setFormation';
                    request.post(url)
                        .set('Content-Type', 'application/json')
                        .send({
                            user : account.name,
                            index: value.partyNum,
                            party: value.partyList
                        })
                        .then(result=>{
                            const data = JSON.stringify(result.body);
                            console.log(data);
                            unityContent.send("PacketManager", "ResponseGetParty", data);
                        
                    }).catch(error=>{
                        console.error(error);
                    });
                    // 
                }).catch(error => {
                    console.error(error);
                });   
            });


        });
        


        unityContent.on("GetServant", () => {
            ScatterJS.scatter.connect('My-App').then(connected => {
                if(!connected) return false;
                const scatter = ScatterJS.scatter;
                const requiredFields = { accounts:[network] };
                scatter.getIdentity(requiredFields).then(() => {
                    const account = scatter.identity.accounts.find(x => x.blockchain === 'eos');
                   
                    // POST Request
                    const request = require('superagent');
                    const url=testnetserver+'getServant';
                    request.post(url)
                        .set('Content-Type', 'application/json')
                        .send({user : account.name})
                        .then(result=>{
                        const data = JSON.stringify(result.body);
                        console.log(result);
                        unityContent.send("PacketManager", "ResponseGetAllServant", data);

                    }).catch(error=>{
                        console.error(error);
                    });
                    // 
                }).catch(error => {
                    console.error(error);
                });   
            });
        });

        unityContent.on("GetItem", () => {
            ScatterJS.scatter.connect('My-App').then(connected => {
                if(!connected) return false;
                const scatter = ScatterJS.scatter;
                const requiredFields = { accounts:[network] };
                scatter.getIdentity(requiredFields).then(() => {
                    const account = scatter.identity.accounts.find(x => x.blockchain === 'eos');
                   
                    // POST Request
                    const request = require('superagent');
                    const url=testnetserver+'getItem';
                    request.post(url)
                        .set('Content-Type', 'application/json')
                        .send({user : account.name})
                        .then(result=>{
                        const data = JSON.stringify(result.body);
                        console.log(result);
                        unityContent.send("Packet", "TestReceive", data);

                    }).catch(error=>{
                        console.error(error);
                    });
                    // 
                }).catch(error => {
                    console.error(error);
                });   
            });
        });

        unityContent.on("GetMonster", () => {
            ScatterJS.scatter.connect('My-App').then(connected => {
                if(!connected) return false;
                const scatter = ScatterJS.scatter;
                const requiredFields = { accounts:[network] };
                scatter.getIdentity(requiredFields).then(() => {
                    const account = scatter.identity.accounts.find(x => x.blockchain === 'eos');
                   
                    // POST Request
                    const request = require('superagent');
                    const url=testnetserver+'getMonster';
                    request.post(url)
                        .set('Content-Type', 'application/json')
                        .send({user : account.name})
                        .then(result=>{
                        const data = JSON.stringify(result.body);
                        console.log(result);
                        unityContent.send("PacketManager", "ResponseGetAllMonster", data);

                    }).catch(error=>{
                        console.error(error);
                    });
                    // 
                }).catch(error => {
                    console.error(error);
                });   
            });
        });

        unityContent.on("Logout", () => {
            ScatterJS.scatter.connect('My-App').then(connected => {
                if(!connected) return false;
                const scatter = ScatterJS.scatter;
               scatter.forgetIdentity();
               unityContent.send("PacketManager", "ResponseGetAllMonster", false);
            });
        });

        unityContent.on("BattleAction", data => {
            ScatterJS.scatter.connect('My-App').then(connected => {
                if(!connected) return false;
                const scatter = ScatterJS.scatter;
                const requiredFields = { accounts:[network] };
                scatter.getIdentity(requiredFields).then(() => {
                    const account = scatter.identity.accounts.find(x => x.blockchain === 'eos');
                   
                    // POST Request
                    const request = require('superagent');
                    const url=testnetserver+'seed';
                    const value = JSON.parse(data);
                    console.log('data'+data);
                    console.log('value'+value);
                    request.post(url)
                        .set('Content-Type', 'application/json')
                        .send()
                        .then(result=>{
                            // POST Request
                            const url=testnetserver+'battle';
                            request.post(url)
                            .set('Content-Type', 'application/json')
                            .send()
                            .then(result=>{
                                const data = JSON.stringify(result);
                                unityContent.send("PacketManager", "ResponseBattleAction", data);
                            }).catch(error=>{
                                console.error(error);
                            });
                            // 
                            const eosOptions = { expireInSeconds:60 };
                            const eos = scatter.eos(network, Eos, eosOptions);
                            eos.transaction({
                                actions:[
                                    {
                                        account : 'unlimitedmas',
                                        name : 'activeturn',
                                        authorization:[{
                                            actor : account.name,
                                            permission : account.authority
                                        }],
                                        data : {
                                            _user : account.name,
                                            _hero_action : value.heroActionType,
                                            _monster_action : value.monsterActionType,
                                            _hero_target : value.heroTargetIndex,
                                            _monster_target : value.monsterTargetIndex,
                                            _seed : result.body.num +':'+ result.body.seed
                                        }
                                    }                  
                                ]
                            });
                    }).catch(error=>{
                        console.error(error);
                    });
                    // 
                }).catch(error => {
                    console.error(error);
                });   
            });
        });
        unityContent.on("StartBattle", data => {
            console.log('1:' + data);

            ScatterJS.scatter.connect('My-App').then(connected => {
                if (!connected) return false;
                const scatter = ScatterJS.scatter;
                const requiredFields = { accounts: [network] };
                console.log('2:' + data);

                scatter.getIdentity(requiredFields).then(() => {
                    console.log('3:' + data);
                    
                    const account = scatter.identity.accounts.find(x => x.blockchain === 'eos');
                    const request = require('superagent');
                    const value = JSON.parse(data);
                    const eosOptions = { expireInSeconds: 60 };

                    const eos = scatter.eos(network, Eos, eosOptions);
                    console.log('4:'+data);
                    
                    console.log('5:'+data);

                    console.log('1:'+value);
                    eos.transaction({
                        actions: [
                            {
                                account: 'unlimitedmas',
                                name: 'startbattle',
                                authorization: [{
                                    actor: account.name,
                                    permission: account.authority
                                }],
                                data: {
                                    _user: account.name,
                                    _party_number: value.partyNum,
                                    _stage: value.stageNum
                                }
                            }
                        ]
                    });
                    //unityContent.send("PacketManager", "ResponseStageStart", data);

                   
                    const gachaurl = testnetserver + 'battlestart';
                    request.post(gachaurl)
                        .set('Content-Type', 'application/json')
                        .send({ user: account.name })
                        .then(result => {
                            const data = JSON.stringify(result.body);
                            unityContent.send("PacketManager", "ResponseStageStart", data);
                            console.log('data:'+data);
                        }).catch(error => {
                            console.error(error);
                        });

                }).catch(error => {
                    console.error(error);
                });

            });
        });
        unityContent.on("GetReward", data => {
            ScatterJS.scatter.connect('My-App').then(connected => {
                if(!connected) return false;
                const scatter = ScatterJS.scatter;
                const requiredFields = { accounts:[network] };
                scatter.getIdentity(requiredFields).then(() => {
                    const account = scatter.identity.accounts.find(x => x.blockchain === 'eos');
                    const eosOptions = { expireInSeconds:60 };
                    const eos = scatter.eos(network, Eos, eosOptions);

                         eos.transaction({
                                actions:[
                                    {
                                        account : 'unlimitedmas',
                                        name : 'getreward',
                                        authorization:[{
                                            actor : account.name,
                                            permission : account.authority
                                        }],
                                        data : {
                                            _user : account.name,
                                        }
                                    }                  
                                ]
                            });
                            
                            unityContent.send("PacketManager", "ResponseStageResult", data);
    
                }).catch(error => {
                    console.error(error);
                });   
            });
        });
    }
    
    

    render() {
        return (
            <div>
            <Unity unityContent={unityContent} className = "unityapp"   />
            
            </div>
        );
    }
}

export default App;