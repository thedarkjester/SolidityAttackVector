// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

/// @author The Dark Jester
/// @title A simple attack vector
contract AttackVector {
  string private textField ;

  constructor() public{
      
  }

  /// Store `textToSet`.
  /// @param textToSet the text to store
  function setTextField(string memory textToSet) public {
    textField = textToSet;
  }

  /// Return the stored textField.
  /// @return the stored textField
  function getTextField() public view returns (string memory) {
    return textField;
  }

  function getValidatedText() public view returns (string memory) {
    if(checkString(textField)){
        return textField;
    }

    return "Oh no, someone put nasty text in here!!!";
  }

  function checkString(string memory str) private pure returns (bool){
    bytes memory b = bytes(str);

    for(uint i; i<b.length; i++){
        bytes1 char = b[i];

        if(
            !(char >= 0x30 && char <= 0x39) &&
            !(char >= 0x30 && char <= 0x39) && //9-0
            !(char >= 0x41 && char <= 0x5A) && //A-Z
            !(char >= 0x61 && char <= 0x7A) && //a-z
            !(char == 0x2E) //.
        )
            return false;
    }

    return true;
  }
}