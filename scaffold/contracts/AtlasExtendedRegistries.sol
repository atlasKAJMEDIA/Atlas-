// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/*
 * Atlas — extended on-chain registries for Robinhood Chain.
 *
 * Completes the 10-contract set named in the product spec. The first six live
 * in AtlasRegistries.sol; these are the remaining four:
 *
 *   ProposalRegistry     — governance proposals & voting
 *   IdentityRegistry     — verifiable handles/attestations per organization
 *   NotificationRegistry — on-chain notification feed powering the UI
 *   ActivityRegistry     — append-only activity log (the on-chain half of AI Memory)
 *
 * Self-contained, no external dependencies — builds with plain `forge build`.
 * Every contract emits events so the frontend can subscribe in real time.
 */

/* ------------------------------------------------------------------ */
contract ProposalRegistry {
    enum Status { Open, Passed, Rejected, Executed, Cancelled }

    struct Proposal {
        uint256 id;
        uint256 orgId;
        address author;
        string title;
        string detailsURI;   // IPFS/Arweave pointer to the full proposal
        Status status;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 createdAt;
        uint256 closesAt;
    }

    uint256 public nextId = 1;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => uint256[]) public orgProposals;          // orgId => proposal ids
    mapping(uint256 => mapping(address => bool)) public voted;  // proposalId => voter => hasVoted

    event ProposalCreated(uint256 indexed id, uint256 indexed orgId, address indexed author, string title);
    event VoteCast(uint256 indexed id, address indexed voter, bool support, uint256 weight);
    event ProposalStatusChanged(uint256 indexed id, Status status);

    function create(uint256 orgId, string calldata title, string calldata detailsURI, uint256 votingPeriod)
        external
        returns (uint256 id)
    {
        require(bytes(title).length > 0, "empty title");
        id = nextId++;
        proposals[id] = Proposal({
            id: id,
            orgId: orgId,
            author: msg.sender,
            title: title,
            detailsURI: detailsURI,
            status: Status.Open,
            forVotes: 0,
            againstVotes: 0,
            createdAt: block.timestamp,
            closesAt: block.timestamp + votingPeriod
        });
        orgProposals[orgId].push(id);
        emit ProposalCreated(id, orgId, msg.sender, title);
    }

    function vote(uint256 id, bool support) external {
        Proposal storage p = proposals[id];
        require(p.id != 0, "no proposal");
        require(p.status == Status.Open, "not open");
        require(block.timestamp <= p.closesAt, "voting closed");
        require(!voted[id][msg.sender], "already voted");

        voted[id][msg.sender] = true;
        if (support) p.forVotes += 1;
        else p.againstVotes += 1;
        emit VoteCast(id, msg.sender, support, 1);
    }

    function finalize(uint256 id) external {
        Proposal storage p = proposals[id];
        require(p.id != 0, "no proposal");
        require(p.status == Status.Open, "not open");
        require(block.timestamp > p.closesAt, "still open");

        p.status = p.forVotes > p.againstVotes ? Status.Passed : Status.Rejected;
        emit ProposalStatusChanged(id, p.status);
    }

    function byOrg(uint256 orgId) external view returns (uint256[] memory) {
        return orgProposals[orgId];
    }
}

/* ------------------------------------------------------------------ */
contract IdentityRegistry {
    /*
     * Binds off-chain handles (GitHub, X, Farcaster, domain) to an org.
     * Claims are self-asserted; an authorized attestor can verify them, which
     * is what the Reputation engine should weight rather than raw claims.
     */
    struct Claim {
        string platform;   // "github" | "x" | "farcaster" | "domain" | ...
        string handle;
        bool verified;
        address attestor;
        uint256 updatedAt;
    }

    address public owner;
    mapping(address => bool) public attestors;
    mapping(uint256 => mapping(string => Claim)) public claims; // orgId => platform => claim
    mapping(uint256 => string[]) private _platforms;

    event ClaimSet(uint256 indexed orgId, string platform, string handle);
    event ClaimVerified(uint256 indexed orgId, string platform, address indexed attestor);
    event AttestorSet(address indexed attestor, bool allowed);

    constructor() {
        owner = msg.sender;
        attestors[msg.sender] = true;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    function setAttestor(address who, bool allowed) external onlyOwner {
        attestors[who] = allowed;
        emit AttestorSet(who, allowed);
    }

    function setClaim(uint256 orgId, string calldata platform, string calldata handle) external {
        Claim storage c = claims[orgId][platform];
        if (bytes(c.platform).length == 0) _platforms[orgId].push(platform);
        c.platform = platform;
        c.handle = handle;
        c.verified = false; // re-claiming resets verification
        c.attestor = address(0);
        c.updatedAt = block.timestamp;
        emit ClaimSet(orgId, platform, handle);
    }

    function verifyClaim(uint256 orgId, string calldata platform) external {
        require(attestors[msg.sender], "not attestor");
        Claim storage c = claims[orgId][platform];
        require(bytes(c.platform).length != 0, "no claim");
        c.verified = true;
        c.attestor = msg.sender;
        c.updatedAt = block.timestamp;
        emit ClaimVerified(orgId, platform, msg.sender);
    }

    function platformsOf(uint256 orgId) external view returns (string[] memory) {
        return _platforms[orgId];
    }
}

/* ------------------------------------------------------------------ */
contract NotificationRegistry {
    /*
     * On-chain notification feed. Spec: "Each contract exposes events powering
     * frontend in real time" — this is the generic channel for anything that
     * should surface in the app's notification surface.
     */
    enum Level { Info, Opportunity, Urgent }

    struct Notification {
        uint256 id;
        uint256 toOrg;
        address from;
        Level level;
        string title;
        string bodyURI;
        bool read;
        uint256 createdAt;
    }

    uint256 public nextId = 1;
    mapping(uint256 => Notification) public notifications;
    mapping(uint256 => uint256[]) public orgInbox; // orgId => notification ids

    event Notified(uint256 indexed id, uint256 indexed toOrg, Level level, string title);
    event NotificationRead(uint256 indexed id, uint256 indexed toOrg);

    function notify(uint256 toOrg, Level level, string calldata title, string calldata bodyURI)
        external
        returns (uint256 id)
    {
        id = nextId++;
        notifications[id] = Notification(id, toOrg, msg.sender, level, title, bodyURI, false, block.timestamp);
        orgInbox[toOrg].push(id);
        emit Notified(id, toOrg, level, title);
    }

    function markRead(uint256 id) external {
        Notification storage n = notifications[id];
        require(n.id != 0, "no notification");
        n.read = true;
        emit NotificationRead(id, n.toOrg);
    }

    function inbox(uint256 orgId) external view returns (uint256[] memory) {
        return orgInbox[orgId];
    }

    function unreadCount(uint256 orgId) external view returns (uint256 count) {
        uint256[] storage ids = orgInbox[orgId];
        for (uint256 i = 0; i < ids.length; i++) {
            if (!notifications[ids[i]].read) count++;
        }
    }
}

/* ------------------------------------------------------------------ */
contract ActivityRegistry {
    /*
     * Append-only activity log — the on-chain counterpart to Atlas's AI Memory.
     * Records what an org did (outreach sent, grant applied, partnership moved)
     * so recommendations and reputation can be derived from verifiable history
     * rather than self-reported state.
     */
    struct Activity {
        uint256 id;
        uint256 orgId;
        address actor;
        string kind;      // "outreach_sent" | "grant_applied" | "status_changed" | ...
        string subject;   // counterparty / program / opportunity name
        string metaURI;   // optional pointer to full payload
        uint256 at;
    }

    uint256 public nextId = 1;
    mapping(uint256 => Activity) public activities;
    mapping(uint256 => uint256[]) public orgActivity;
    mapping(uint256 => mapping(string => uint256)) public kindCount; // orgId => kind => count

    event ActivityLogged(uint256 indexed id, uint256 indexed orgId, address indexed actor, string kind, string subject);

    function log(uint256 orgId, string calldata kind, string calldata subject, string calldata metaURI)
        external
        returns (uint256 id)
    {
        id = nextId++;
        activities[id] = Activity(id, orgId, msg.sender, kind, subject, metaURI, block.timestamp);
        orgActivity[orgId].push(id);
        kindCount[orgId][kind] += 1;
        emit ActivityLogged(id, orgId, msg.sender, kind, subject);
    }

    function history(uint256 orgId) external view returns (uint256[] memory) {
        return orgActivity[orgId];
    }

    function countOf(uint256 orgId, string calldata kind) external view returns (uint256) {
        return kindCount[orgId][kind];
    }
}
