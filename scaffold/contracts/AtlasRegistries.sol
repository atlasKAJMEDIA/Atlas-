// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/*
 * Atlas — BD Operating System for Robinhood Chain
 * Core on-chain registries. Self-contained (no external deps) so it
 * builds with a plain `forge build`. Swap in OpenZeppelin later if you
 * want ERC721 Organization NFTs / Ownable / AccessControl.
 *
 * Contracts:
 *   ProjectRegistry       — projects register, receive an Organization ID
 *   OrganizationRegistry  — members, roles, departments
 *   PartnershipRegistry   — partnership lifecycle w/ transparent history
 *   GrantRegistry         — grant applications, status, milestones
 *   InvestorRegistry      — VC/angel profiles
 *   ReputationRegistry    — score from onchain contributions
 */

/* ------------------------------------------------------------------ */
contract ProjectRegistry {
    struct Project {
        uint256 id;
        address owner;
        string name;
        string category;
        string metadataURI; // IPFS/Arweave pointer for website/docs/whitepaper
        uint256 createdAt;
        bool exists;
    }

    uint256 public nextId = 1;
    mapping(uint256 => Project) public projects;
    mapping(address => uint256) public ownerToProject; // one primary org per wallet

    event ProjectRegistered(uint256 indexed id, address indexed owner, string name, string category);
    event ProjectUpdated(uint256 indexed id, string metadataURI);

    function register(string calldata name, string calldata category, string calldata metadataURI)
        external
        returns (uint256 id)
    {
        require(ownerToProject[msg.sender] == 0, "already registered");
        id = nextId++;
        projects[id] = Project(id, msg.sender, name, category, metadataURI, block.timestamp, true);
        ownerToProject[msg.sender] = id;
        emit ProjectRegistered(id, msg.sender, name, category);
    }

    function updateMetadata(uint256 id, string calldata metadataURI) external {
        require(projects[id].exists, "no project");
        require(projects[id].owner == msg.sender, "not owner");
        projects[id].metadataURI = metadataURI;
        emit ProjectUpdated(id, metadataURI);
    }

    function getProject(uint256 id) external view returns (Project memory) {
        return projects[id];
    }
}

/* ------------------------------------------------------------------ */
contract OrganizationRegistry {
    enum Role { None, Viewer, Member, Admin, Owner }

    mapping(uint256 => mapping(address => Role)) public roles; // orgId => member => role
    mapping(uint256 => address[]) private _members;

    event MemberSet(uint256 indexed orgId, address indexed member, Role role);

    function setMember(uint256 orgId, address member, Role role) external {
        // caller must be Admin/Owner of the org (Owner bootstrap: first setter allowed)
        Role callerRole = roles[orgId][msg.sender];
        require(
            callerRole == Role.Admin || callerRole == Role.Owner || _members[orgId].length == 0,
            "not authorized"
        );
        if (roles[orgId][member] == Role.None && role != Role.None) {
            _members[orgId].push(member);
        }
        roles[orgId][member] = role;
        emit MemberSet(orgId, member, role);
    }

    function members(uint256 orgId) external view returns (address[] memory) {
        return _members[orgId];
    }
}

/* ------------------------------------------------------------------ */
contract PartnershipRegistry {
    enum Status { Draft, Sent, Negotiating, Accepted, Signed, Completed, Rejected }

    struct Partnership {
        uint256 id;
        uint256 fromOrg;
        string counterparty; // name or address of target
        Status status;
        string note;
        uint256 updatedAt;
    }

    uint256 public nextId = 1;
    mapping(uint256 => Partnership) public partnerships;
    mapping(uint256 => uint256[]) public orgPartnerships; // orgId => partnership ids

    event PartnershipLogged(uint256 indexed id, uint256 indexed fromOrg, string counterparty, Status status);
    event PartnershipStatusChanged(uint256 indexed id, Status status);

    function log(uint256 fromOrg, string calldata counterparty, string calldata note)
        external
        returns (uint256 id)
    {
        id = nextId++;
        partnerships[id] = Partnership(id, fromOrg, counterparty, Status.Draft, note, block.timestamp);
        orgPartnerships[fromOrg].push(id);
        emit PartnershipLogged(id, fromOrg, counterparty, Status.Draft);
    }

    function setStatus(uint256 id, Status status) external {
        require(partnerships[id].id != 0, "no partnership");
        partnerships[id].status = status;
        partnerships[id].updatedAt = block.timestamp;
        emit PartnershipStatusChanged(id, status);
    }

    function pipeline(uint256 orgId) external view returns (uint256[] memory) {
        return orgPartnerships[orgId];
    }
}

/* ------------------------------------------------------------------ */
contract GrantRegistry {
    enum Status { Applied, UnderReview, Approved, Rejected, Disbursed }

    struct Grant {
        uint256 id;
        uint256 orgId;
        string program;
        uint256 amount; // in wei-equivalent units, informational
        Status status;
        uint256 appliedAt;
    }

    uint256 public nextId = 1;
    mapping(uint256 => Grant) public grants;
    mapping(uint256 => uint256[]) public orgGrants;

    event GrantApplied(uint256 indexed id, uint256 indexed orgId, string program, uint256 amount);
    event GrantStatusChanged(uint256 indexed id, Status status);

    function apply_(uint256 orgId, string calldata program, uint256 amount)
        external
        returns (uint256 id)
    {
        id = nextId++;
        grants[id] = Grant(id, orgId, program, amount, Status.Applied, block.timestamp);
        orgGrants[orgId].push(id);
        emit GrantApplied(id, orgId, program, amount);
    }

    function setStatus(uint256 id, Status status) external {
        require(grants[id].id != 0, "no grant");
        grants[id].status = status;
        emit GrantStatusChanged(id, status);
    }

    function byOrg(uint256 orgId) external view returns (uint256[] memory) {
        return orgGrants[orgId];
    }
}

/* ------------------------------------------------------------------ */
contract InvestorRegistry {
    struct Investor {
        uint256 id;
        address wallet;
        string name;
        string kind;      // "VC" | "Angel" | "Fund"
        string thesisURI; // pointer to thesis / focus areas
        bool exists;
    }

    uint256 public nextId = 1;
    mapping(uint256 => Investor) public investors;

    event InvestorRegistered(uint256 indexed id, string name, string kind);

    function register(string calldata name, string calldata kind, string calldata thesisURI)
        external
        returns (uint256 id)
    {
        id = nextId++;
        investors[id] = Investor(id, msg.sender, name, kind, thesisURI, true);
        emit InvestorRegistered(id, name, kind);
    }
}

/* ------------------------------------------------------------------ */
contract ReputationRegistry {
    // Simple additive reputation. In production, gate updates behind an
    // authorized scorer / other registries emitting verified events.
    mapping(uint256 => uint256) public score; // orgId => score

    event ReputationChanged(uint256 indexed orgId, uint256 newScore, string reason);

    function add(uint256 orgId, uint256 points, string calldata reason) external {
        score[orgId] += points;
        emit ReputationChanged(orgId, score[orgId], reason);
    }
}
