import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { getKeys, sendAmount, getTMBalance, payVPNSession } from '../Actions/tendermint.action';
import { payVPNTM } from '../Actions/vpnlist.action';
import CustomTextField from './customTextfield';
import { Button, Snackbar } from '@material-ui/core';
import { createAccountStyle } from '../Assets/createtm.styles';
import { accountStyles } from '../Assets/tmaccount.styles';
import { withStyles } from '@material-ui/core/styles';
import { compose } from 'recompose';

const Customstyles = theme => ({
    button: {
        margin: theme.spacing.unit,
    }
});

class TMTransactions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            toAddress: '',
            keyPassword: '',
            amount: '',
            openSnack: false,
            snackMessage: '',
            isTextDisabled: false
        }
    }

    componentWillMount = () => {
        this.props.getKeys();
    }

    componentWillReceiveProps = (nextProps) => {
        if (nextProps.vpnPayment.isPayment) {
            this.setState({ toAddress: nextProps.vpnPayment.data.vpn_addr, amount: 100, isTextDisabled: true })
        }
        else {
            this.setState({ isTextDisabled: false })
        }
    }

    sendTransaction = () => {
        this.props.getTMBalance(this.props.keys[0].address).then(res => {
            console.log("res...p", res);
            if (res.payload && 'value' in res.payload) {
                if (this.props.vpnPayment.isPayment) {
                    let data = {
                        "amount": [{ "denom": "sentinelToken", "amount": this.state.amount.toString() }],
                        "name": this.props.keys[0].name,
                        "password": this.state.keyPassword,
                        "gas": "200000",
                        "vaddress": this.state.toAddress
                    }
                    this.props.payVPNSession(data).then(response => {
                        console.log("Pay VPN...", response);
                    })
                }
                else {
                    let data = {
                        "amount": [{ "denom": "sentinelToken", "amount": this.state.amount.toString() }],
                        "name": this.props.keys[0].name,
                        "password": this.state.keyPassword,
                        "chain_id": "test-chain-3GuVCm",
                        "gas": "200000",
                        "address": this.state.toAddress,
                        "account_number": res.payload.value.account_number,
                        "sequence": res.payload.value.sequence
                    }
                    this.props.sendAmount(data, this.state.toAddress).then(response => {
                        console.log("Result...", response);
                    });
                }
            }
            else {
                this.setState({ openSnack: true, snackMessage: 'Problem faced while doing transaction' })
            }
        })
    }

    handleClose = (event, reason) => {
        this.setState({ openSnack: false });
    };

    render() {
        const { classes } = this.props;
        return (
            <div style={accountStyles.formStyle}>
                <div style={createAccountStyle.secondDivStyle}>
                    <p style={createAccountStyle.headingStyle}>To Address</p>
                    <CustomTextField type={'text'} placeholder={''} disabled={this.state.isTextDisabled}
                        value={this.state.toAddress} onChange={(e) => { this.setState({ toAddress: e.target.value }) }}
                    />
                    <p style={createAccountStyle.headingStyle}>Amount</p>
                    <CustomTextField type={'number'} placeholder={''} disabled={this.state.isTextDisabled}
                        value={this.state.amount} onChange={(e) => { this.setState({ amount: e.target.value }) }}
                    />
                    <p style={createAccountStyle.headingStyle}>Account Password</p>
                    <CustomTextField type={'password'} placeholder={''} disabled={false}
                        value={this.state.password} onChange={(e) => { this.setState({ keyPassword: e.target.value }) }}
                    />
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => { this.sendTransaction() }}
                        className={classes.button} style={{ margin: 20, outline: 'none' }}>
                        Send
                    </Button>
                </div>
                <Snackbar
                    open={this.state.openSnack}
                    autoHideDuration={4000}
                    onClose={this.handleClose}
                    message={this.state.snackMessage}
                />
            </div>
        )
    }
}

TMTransactions.propTypes = {
    classes: PropTypes.object.isRequired,
};


function mapStateToProps(state) {
    return {
        lang: state.setLanguage,
        isTest: state.setTestNet,
        keys: state.getKeys,
        vpnPayment: state.payVPNTM
    }
}

function mapDispatchToActions(dispatch) {
    return bindActionCreators({
        getKeys,
        sendAmount,
        getTMBalance,
        payVPNTM,
        payVPNSession
    }, dispatch)
}

export default compose(withStyles(Customstyles), connect(mapStateToProps, mapDispatchToActions))(TMTransactions);