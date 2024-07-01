// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

import {IEntryPoint} from "./interfaces/IEntryPoint.sol";
import {Wallet} from "./Wallet.sol";
import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract WalletFactory {
    Wallet public immutable walletImplementation;

    constructor(IEntryPoint entryPoint) {
        walletImplementation = new Wallet(entryPoint, address(this));
    }
    event AddressComputed(address computedAddress);
    event IntermediateValues(bytes walletInit, bytes proxyConstructor, bytes bytecode, bytes32 bytecodeHash);

 function validateOwners(address[] memory owners) internal pure returns (bool) {
        for (uint256 i = 0; i < owners.length; i++) {
            if (owners[i] == address(0)) {
                return false;
            }
        }
        return true;
    }
    function createAccount(
        address[] memory owners,
        uint256 salt
    ) external returns (Wallet) {
        address addr = getAddress(owners, salt);
        uint256 codeSize = addr.code.length;
        if (codeSize > 0) {
            return Wallet(payable(addr));
        }

        bytes memory walletInit = abi.encodeCall(Wallet.initialize, owners);
        ERC1967Proxy proxy = new ERC1967Proxy{salt: bytes32(salt)}(
            address(walletImplementation),
            walletInit
        );

        return Wallet(payable(address(proxy)));
    }

function getAddress(
        address[] memory owners,
        uint256 salt
    ) public view returns (address) {
        require(owners.length > 0, "WalletFactory: Owners array must not be empty");
        require(salt != 0, "WalletFactory: Salt value must not be zero");
        require(validateOwners(owners), "WalletFactory: Invalid owners array format");
        
        bytes memory walletInit = abi.encodeCall(Wallet.initialize, owners);
        bytes memory proxyConstructor = abi.encode(
            address(walletImplementation),
            walletInit
        );
        bytes memory bytecode = abi.encodePacked(
            type(ERC1967Proxy).creationCode,
            proxyConstructor
        );

        bytes32 bytecodeHash = keccak256(bytecode);

        address computedAddress = Create2.computeAddress(bytes32(salt), bytecodeHash);

        return computedAddress;
    }
}