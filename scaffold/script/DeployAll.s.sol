// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/HelixRegistries.sol";
import "../contracts/HelixExtendedRegistries.sol";

contract DeployAll is Script {
    function run() external {
        vm.startBroadcast();

        // Core six
        ProjectRegistry      project      = new ProjectRegistry();
        OrganizationRegistry organization = new OrganizationRegistry();
        PartnershipRegistry  partnership  = new PartnershipRegistry();
        GrantRegistry        grant        = new GrantRegistry();
        InvestorRegistry     investor     = new InvestorRegistry();
        ReputationRegistry   reputation   = new ReputationRegistry();

        // Extended four
        ProposalRegistry     proposal     = new ProposalRegistry();
        IdentityRegistry     identity     = new IdentityRegistry();
        NotificationRegistry notification = new NotificationRegistry();
        ActivityRegistry     activity     = new ActivityRegistry();

        console.log("--- Copy these into .env.local ---");
        console.log("NEXT_PUBLIC_PROJECT_REGISTRY=",      address(project));
        console.log("NEXT_PUBLIC_ORG_REGISTRY=",          address(organization));
        console.log("NEXT_PUBLIC_PARTNERSHIP_REGISTRY=",  address(partnership));
        console.log("NEXT_PUBLIC_GRANT_REGISTRY=",        address(grant));
        console.log("NEXT_PUBLIC_INVESTOR_REGISTRY=",     address(investor));
        console.log("NEXT_PUBLIC_REPUTATION_REGISTRY=",   address(reputation));
        console.log("NEXT_PUBLIC_PROPOSAL_REGISTRY=",     address(proposal));
        console.log("NEXT_PUBLIC_IDENTITY_REGISTRY=",     address(identity));
        console.log("NEXT_PUBLIC_NOTIFICATION_REGISTRY=", address(notification));
        console.log("NEXT_PUBLIC_ACTIVITY_REGISTRY=",     address(activity));

        vm.stopBroadcast();
    }
}
