// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/AtlasRegistries.sol";

contract DeployAll is Script {
    function run() external {
        vm.startBroadcast();

        ProjectRegistry      project      = new ProjectRegistry();
        OrganizationRegistry organization = new OrganizationRegistry();
        PartnershipRegistry  partnership  = new PartnershipRegistry();
        GrantRegistry        grant        = new GrantRegistry();
        InvestorRegistry     investor     = new InvestorRegistry();
        ReputationRegistry   reputation   = new ReputationRegistry();

        console.log("ProjectRegistry:      ", address(project));
        console.log("OrganizationRegistry: ", address(organization));
        console.log("PartnershipRegistry:  ", address(partnership));
        console.log("GrantRegistry:        ", address(grant));
        console.log("InvestorRegistry:     ", address(investor));
        console.log("ReputationRegistry:   ", address(reputation));

        vm.stopBroadcast();
    }
}
