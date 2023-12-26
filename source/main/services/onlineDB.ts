import https from 'https';


const axios = require('axios');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
let weburl = "https://localhost:7212/";

export async function createVaultForDB(jwt: string, vault_name: string, vault_data: string) {
    try {
        const addUserVault = {
            "tideUID": 0,
            "vaultData": [
                {
                    "id": 0,
                    "vaultName": vault_name,
                    "vaults": [
                        vault_data
                    ]
                }
            ]
        }

        axios.put(weburl + "api/UserDatas", addUserVault, { httpsAgent }).then(response => {
            console.log("Response Status: ", response.status)
        }).catch(error => {
            console.error('There was an error!', error.message);
        });
    } catch (error) {
        console.log("Error: ", error.message);
    }
}

export async function deleteVaultFromDB(jwt, id) {
    axios.delete(weburl + 'api/UserDatas/' + id, { httpsAgent })
        .then(res => {
            console.log('Status: ', res.status);
            console.log('Status: ', res.data);
        }).catch(err => {
            console.log('error: ', err.message);
        });
}



export async function checkConnectiontoDB(url): Promise<Boolean> {
    weburl = url
    return axios.get(weburl + "api/UserDatas", { httpsAgent }).then(response => {
        console.log("Connection to DB returned status: ", response.status);
        return true;
    }).catch(error => {
        console.log(error.message);
        return false;
    });
}
