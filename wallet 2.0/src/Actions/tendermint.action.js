import * as types from './../Constants/action.names';
import { TM_URL, TM_FREE_TOKEN_URL, TMain_URL } from '../Constants/constants';
import { getTMConfig } from './../Utils/UserConfig';
import axios from 'axios';

// Fetch TxHash from MN API
// Iterate For loop to get info of TxHash Locally [1317/txs/:hash]

export async function getKeys() {
    let response = await axios.get(TM_URL + '/keys', {
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json',
        }
    })
    return {
        type: types.GET_KEYS,
        payload: response.data
    }
}

export function setTMComponent(component) {
    return {
        type: types.SET_TM_COMPONENT,
        payload: component
    }
}

export async function getTMBalance(address) {
    try {
        let response = await axios({
            url: `${TM_URL}/accounts/${address}`,
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-type': 'application/json',
            },
            timeout: 10000
        })
        return {
            type: types.GET_TMBALANCE,
            payload: response.data
        }
    } catch (err) {
        return {
            type: types.GET_TMBALANCE,
            payload: null
        }
    }
}

export async function sendAmount(data, toAddr) {
    try {
        let response = await axios.post(TM_URL + `/send`, data, {
            headers: {
                'Accept': 'application/json',
                'Content-type': 'application/json',
            }
        })
        return {
            type: types.SEND_TMAMOUNT,
            payload: response.data,
            error: null
        }
    } catch (err) {
        return {
            type: types.SEND_TMAMOUNT,
            payload: null,
            error: err.response || 'Something went wrong'
        }
    }
}

export function getTendermintAccount(cb) {
    getTMConfig((err, data) => {
        let configData = data ? JSON.parse(data) : {};
        if (configData && 'tmUserName' in configData)
            cb(configData.tmUserName)
        else
            cb(null)
    })
}

export function setTMAccount(data) {
    return {
        type: types.SET_TM_ACCOUNT,
        payload: data
    }
}

export async function getFreeTokens(account_addr) {
    try {
        let response = await axios({
            url: `${TM_FREE_TOKEN_URL}/get-tokens`,
            method: 'POST',
            data: {
                address: account_addr
            },
            headers: {
                'Accept': 'application/json',
                'Content-type': 'application/json',
            },
            timeout: 12000
        })
        return {
            type: types.GET_TOKENS,
            payload: response.data,
            error: null
        }
    } catch (err) {
        return {
            type: types.GET_TOKENS,
            payload: null,
            error: err.response || 'Something went wrong while getting tokens'
        }
    }
}

export function addTransaction(data) {
    axios.post(`${TMain_URL}/txes`, data, {
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json',
        }
    }).then(res => { })
        .catch(err => { })
}

export function getTransactions(account_addr, cb) {
    axios.get(`${TMain_URL}/txes?fromAccountAddress=${account_addr}&toAccountAddress=${account_addr}`, {
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json',
        }
    }).then(async (res) => {
        if (res.data.txes.length > 0) {
            let txData = await res.data.txes.map(async (details) => {
                let txInfo = await getTxInfo(details.txHash, details.addedOn);
                return txInfo;
            })
            Promise.all(txData).then((data) => { cb(data) })
        } else {
            cb([])
        }
    })
        .catch(err => { cb([]) })
}

export async function getTxInfo(hash, time) {
    try {
        let response = await axios({
            url: TM_URL + '/txs/' + hash,
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-type': 'application/json',
            },
            timeout: 12000
        })
        return ({
            hash: response.data.hash,
            amount: response.data.tx.value.msg[0].type === 'sentinel/getvpnpayment' ?
                100 * (10 ** 8) - parseInt(response.data.tx.value.msg[0].value.Coins[0].amount) :
                response.data.tx.value.msg[0].value.Coins[0].amount,
            from: response.data.tx.value.msg[0].type === 'sentinel/getvpnpayment' ?
                `Released`
                : response.data.tx.value.msg[0].value.From,
            to: response.data.tx.value.msg[0].value.To ? response.data.tx.value.msg[0].value.To : 'ClaimedBy',
            sessionId: response.data.tx.value.msg[0].type === 'sentinel/getvpnpayment' ?
                new Buffer(response.data.tx.value.msg[0].value.Sessionid, 'base64').toString() : null,
            gas: response.data.result.gas_used,
            timestamp: time
        })
    } catch (err) {
        return null
    }
}