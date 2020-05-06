import React, { Component } from 'react';
import Web3 from 'web3';
import Images from '../abis/Images.json' 
import './App.css';

const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
})

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()

  }

  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    console.log('Signed in as Account:', this.state.account)
    const networkId = await web3.eth.net.getId()
    const networkData = Images.networks[networkId]
    if(networkData) {
      const abi = Images.abi
      const address = networkData.address
      const contract = web3.eth.Contract(abi, address)
      this.setState({ contract})
      const imageHash = await contract.methods.get().call()
      this.setState({ imageHash })
    }
    else {
      window.alert('Smart Contract not deployed to the selected network.')
    }
  }

  constructor(props) {
    super(props);
    this.state = { 
      account: '',
      buffer: null,
      contract: null,
      imageHash: 'QmX4aa9s4PgaJNLPVmgNSeCcn1PvfezQpC5mjHS7Z9KAyK',
    };
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3= new  Web3(window.ethereum)
      await window.ethereum.enable()
    } if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      window.alert('Please use METAMASK!!!')
    }
  }
  
  captureFile = (event) => {
    event.preventDefault()
    console.log('File Captured')
    //Process file for IPFS
    console.log('File Data',event.target.files[0])
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result)})
      console.log(this.state.buffer)
    }
  }

//Example hash: "QmX4aa9s4PgaJNLPVmgNSeCcn1PvfezQpC5mjHS7Z9KAyK"
//Example url: https://ipfs.infura.io/ipfs/QmX4aa9s4PgaJNLPVmgNSeCcn1PvfezQpC5mjHS7Z9KAyK

  onSubmit = (event) => {
    event.preventDefault()
    console.log('Submitting the form...')
    console.log('Uploading File...',this.state.buffer)
    ipfs.add(this.state.buffer, (error, result) => {
      console.log('IPFS File',result)
      const imageHash = result[0].hash
      console.log('File Upload Successful.')
      if(error) {
        console.error(error)
        console.log('File Upload Failed.')
        return
      }
      //Store file on blockchain
      this.state.contract.methods.set(imageHash).send({ from: this.state.account}).then((r) => {
        this.setState({ imageHash })    
      })
    })
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a className="navbar-brand col-sm-3 col-md-2 mr-0" href='self' target=''>
            <h2><strong>Cloud Block-Chain</strong></h2> 
          </a>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap text-center d-none d-sm-none d-sm-block">
              <small className="text-white"><font color='#ffa726'><strong><i>{this.state.account}</i></strong></font></small>
            </li>
          </ul>
        </nav>
        <div className="container-fluid mt-5" onLoad={this.updateImage}>
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <p>&nbsp;</p>
                <a href='self'>
                <img id='badge' src={'https://ipfs.infura.io/ipfs/' + this.state.imageHash}  height={200} width={300} alt='' />
                </a>
                <p>&nbsp;</p>
                <h2>Choose File to UPLOAD or SHARE</h2>
                <p>&nbsp;</p>
                <form onSubmit={this.onSubmit}>
                  <input type='file' onChange={this.captureFile}/>
                  <p>&nbsp;</p>
                  <input type='submit' />
                </form>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
