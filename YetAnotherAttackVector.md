### Text on the chain isn't always safe
When it comes to a blockchain, cryptography is king and brings with it many truths. On a decently distributed blockchain transactions are immutable (51% attacks aside), signatures are verified, and depending on how your contract is structured, anyone can interact with it. 

For the purpose of this write-up, we will take an example of a distributed application (dApp) that allows users to register some details in text, afterwhich is viewable on the dApp. Some examples include a marketplace (store name), a domain registrar (domain alias) or just a plain old name for an asset. 

Additionally, in order to avoid centralisation (a tenet of blockchain itself ) there will more than likely be no administrator vetting the data, however, if there was, the spread of the attack may be reduced (it may be silent so the administrator may not even notice it propagating to the user-base).

tl;dr - validate and replace the string fields in your contract on the way out, saving gas, and preventing users getting infected.

### Some background on JavaScript attacks
The type of attack and exploit this article refers to in particular is a [drive-by download](https://www.exabeam.com/information-security/drive-by-download/ "Drive by download") / [DOM Based XSS] (https://owasp.org/www-community/attacks/DOM_Based_XSS "Cross-site scripting") attack, where a modification of the Document Object Model (DOM) is modified to inject and download malicious script.


### Exploiting the string upload in a contract
While it is possible to validate the text on the user interface with JavaScript to not include the script, there are various means to circumvent that. 

* Using the browser debugger to change the final text at the very last call posting to the chain 
* Copying the site code and removing the validation and then uploading to the smart contract
* Creating your own call and directly setting the value on the contract outside of the dApp entirely

A proof of concept can be seen in the sample repository provided ([Sample code] (https://github.com/thedarkjester/SolidityAttackVector "Github sample"))

`contractInstance.setTextField("Nice text<script>alert('I just did a silent javascript drive-by attack');</script>");`

This, when viewed and displayed on the dApp using `.html()` or ``.innerHTML()`(or some other framework that modifies the DOM) would perform the drive-by attack possibly infecting users.  
  
Some attacks could be to fake the MetaMask plugin, add a key-logger or others.

****

## How do I make this safe?


### Off-chain validation

It is possible to use the .text() method of JQuery (or similar JavaScript libraries) to set the value as text rather than allowing it to be written as HTML. 

An example of this can be seen in the sample code provided:
`$("#safeDiv").text(retrievedData);`

There is always the risk an accidental `.html()` is used by a new person maintaining the codebase or a slip in vigilance.  

OWASP provides a [Prevention cheat sheet](https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html "Cheat sheet") to avoid these attacks.

Ideally the validation would prevent the text from being submitted with the malicious script.

### On-chain
Reading the text submitted requires some form of custom regular expression checking or manual text validation similar to the snippet below.

The problem with this is that it costs gas to validate and depending on the length of the string, you could cost a user a fair amount of ETH or hit the block gas limit (10000000 gwei) for even smallish text.

```     
/// @dev this is limited to letters and numbers, but could be modified to allow other options like !
function checkString(string memory str) private pure returns (bool){
     byte s memory b = bytes(str);

     for(uint i; i<b.length; i++){
        bytes1 char = b[i];

        if(
            !(char >= 0x30 && char <= 0x39) &&
            !(char >= 0x30 && char <= 0x39) && //9-0
            !(char >= 0x41 && char <= 0x5A) && //A-Z
            !(char >= 0x61 && char <= 0x7A) && //a-z
            !(char == 0x2E) //.
        )
            // an in memory option to replace things like < with &lt; can also be used here
            return false;
    }

    return true;
  }
```

If you can't rely on validation off-chain, and you can't rely on contract submission validation, how do you make sure the users of you dApp are safe and aren't spending a lot of their ETH just to use your dApp?

An option is to validate the text on the way out and replace the text with something safe if it looks suspicious.

#### Free validation on the way out

Using a view/getter that checks and replaces the text with safer text can cost 0 (yes 0) gas, and make things safer  
  
```
 function getGoodValidatedText() public view returns (string memory) {
    if(checkString(textField)){
        return textField;
    }

    return "Oh no, someone put nasty text in here!!!"; 
  } 
```

****

There may be other ways to perform this validation/replacement and comments and suggestions are welcome. 

A sample of the attack (no malicious code) can be found here: [Sample code](https://github.com/thedarkjester/SolidityAttackVector "Github sample"). This will be actively worked on, extended to cater for more characters and exposed as an on chain Library for others contracts to use.
