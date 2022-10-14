// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { VcVerifier } from "./VCVerifier.sol";
import { DIDpkhAdapter } from "./DIDpkhAdapter.sol";

struct Stamp {
    string id;
    string iamHash;
    string provider;
}

struct StampVc {
    string[] _context;
    string[] _type;
    string issuer;
    string issuanceDate;
    string expirationDate;
    Stamp credentialSubject;
}

contract StampVcVerifier is VcVerifier, DIDpkhAdapter {
    bytes32 private constant CREDENTIAL_SUBJECT_TYPEHASH = keccak256("Stamp(string id,string iamHash,string provider)");

    bytes32 private constant STAMP_VC_TYPEHASH =
        keccak256(
            "StampVc(string[] _context,string[] _type,string issuer,string issuanceDate,string expirationDate,Stamp credentialSubject)Stamp(string id,string iamHash,string provider)"
        );

    address public _verifier;

    event Verified(string indexed id, string iamHash, string provider);

    mapping(string => string) public verifiedStamps;

    constructor(string memory domainName, address verifier) VcVerifier(domainName) {
        _verifier = verifier;
    }

    function hashCredentialSubject(Stamp calldata stamp) public pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    CREDENTIAL_SUBJECT_TYPEHASH,
                    keccak256(bytes(stamp.id)),
                    keccak256(bytes(stamp.iamHash)),
                    keccak256(bytes(stamp.provider))
                )
            );
    }

    function hashStampVC(StampVc calldata stampVc) public pure returns (bytes32) {
        bytes32 credentialSubjectHash = hashCredentialSubject(stampVc.credentialSubject);

        return
            keccak256(
                abi.encode(
                    STAMP_VC_TYPEHASH,
                    _hashArray(stampVc._context),
                    _hashArray(stampVc._type),
                    keccak256(bytes(stampVc.issuer)),
                    keccak256(bytes(stampVc.issuanceDate)),
                    keccak256(bytes(stampVc.expirationDate)),
                    credentialSubjectHash
                )
            );
    }

    function verifyStampVc(
        StampVc calldata exampleVC,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public view returns (bool) {
        bytes32 vcHash = hashStampVC(exampleVC);
        bytes32 digest = ECDSA.toTypedDataHash(DOMAIN_SEPARATOR, vcHash);

        address issuerAddress = DIDpkhAdapter.pseudoResolve(exampleVC.issuer);

        // Here we could check the issuer's address against an on-chain registry.

        address recoveredAddress = ECDSA.recover(digest, v, r, s);

        require(recoveredAddress == issuerAddress, "VC verification failed issuer does not match signature");
        require(recoveredAddress == _verifier, "Not signed by iAM");

        // verifiedStamps[exampleVC.credentialSubject.id] = exampleVC.credentialSubject.iamHash;

        // emit Verified(
        //     exampleVC.credentialSubject.id,
        //     exampleVC.credentialSubject.iamHash,
        //     exampleVC.credentialSubject.provider
        // );
        return true;
    }

    function test(
    ) public view returns (uint256) {
        return 123;
    }
}
