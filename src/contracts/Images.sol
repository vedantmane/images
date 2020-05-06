pragma solidity 0.5.0;

contract Images {
	//Smart Contract Code...
	string imageHash;
	//Write Function
	function set(string memory _imageHash) public {
		imageHash = _imageHash;
	}
	//Read Function
	function get() public view returns (string memory) {
		return imageHash;	
	}
}