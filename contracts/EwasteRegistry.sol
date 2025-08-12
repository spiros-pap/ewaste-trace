// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract EwasteRegistry is AccessControl {
    using Strings for uint256;

    bytes32 public constant ADMIN_ROLE       = keccak256("ADMIN");
    bytes32 public constant USER_ROLE        = keccak256("USER");
    bytes32 public constant GREEN_POINT_ROLE = keccak256("GREEN_POINT");
    bytes32 public constant CARRIER_ROLE     = keccak256("CARRIER");
    bytes32 public constant RECYCLER_ROLE    = keccak256("RECYCLER");
    bytes32 public constant INSPECTOR_ROLE   = keccak256("INSPECTOR");

    enum Hazard { Low, Medium, High }
    enum DeviceState { Functional, Damaged, Hazardous }
    enum Phase { Registered, Collected, InTransit, DeliveredToRecycler, Processed }
    enum ProcessKind { Recycle, Destroy }

    struct Ewaste {
        string uid;
        string category;
        Hazard hazard;
        DeviceState state;
        address owner;
        Phase phase;
        bool exists;
    }

    struct TransferHop {
        uint256 timestamp;
        address from;
        address to;
        string fromSite;
        string toSite;
        string notes;
    }

    mapping(bytes32 => Ewaste) private devices;
    mapping(bytes32 => TransferHop[]) private history;

    event UserRegistered(address indexed user, bytes32 indexed role);
    event DeviceRegistered(bytes32 indexed uidHash, string uid, string category, address indexed owner);
    event Collected(bytes32 indexed uidHash, address indexed by, string site);
    event TransferRecorded(bytes32 indexed uidHash, address indexed by, string fromSite, string toSite);
    event Delivered(bytes32 indexed uidHash, address indexed by, string recyclerSite);
    event Processed(bytes32 indexed uidHash, address indexed by, ProcessKind kind);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
    }

    function _uidHash(string memory uid) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(uid));
    }
    function _requireExists(bytes32 uidHash) internal view {
        require(devices[uidHash].exists, "EW: not found");
    }

    function registerUser(address user, bytes32 role) external onlyRole(ADMIN_ROLE) {
        require(
            role == USER_ROLE || role == GREEN_POINT_ROLE || role == CARRIER_ROLE ||
            role == RECYCLER_ROLE || role == INSPECTOR_ROLE || role == ADMIN_ROLE,
            "EW: invalid role"
        );
        _grantRole(role, user);
        emit UserRegistered(user, role);
    }

    function registerDevice(
        string calldata uid,
        string calldata category,
        Hazard hazard,
        DeviceState state
    ) external onlyRole(USER_ROLE) {
        bytes32 id = _uidHash(uid);
        require(!devices[id].exists, "EW: uid exists");

        devices[id] = Ewaste({
            uid: uid,
            category: category,
            hazard: hazard,
            state: state,
            owner: msg.sender,
            phase: Phase.Registered,
            exists: true
        });

        emit DeviceRegistered(id, uid, category, msg.sender);
    }

    function confirmCollection(string calldata uid, string calldata site)
        external onlyRole(GREEN_POINT_ROLE)
    {
        bytes32 id = _uidHash(uid);
        _requireExists(id);
        Ewaste storage d = devices[id];
        require(d.phase == Phase.Registered, "EW: wrong phase");
        d.phase = Phase.Collected;

        history[id].push(TransferHop({
            timestamp: block.timestamp,
            from: d.owner,
            to: msg.sender,
            fromSite: "Registered",
            toSite: site,
            notes: "Collected at Green Point"
        }));
        emit Collected(id, msg.sender, site);
    }

    function recordTransfer(
        string calldata uid,
        string calldata fromSite,
        string calldata toSite,
        string calldata notes
    ) external onlyRole(CARRIER_ROLE) {
        bytes32 id = _uidHash(uid);
        _requireExists(id);
        Ewaste storage d = devices[id];
        require(d.phase == Phase.Collected || d.phase == Phase.InTransit, "EW: wrong phase");
        d.phase = Phase.InTransit;

        history[id].push(TransferHop({
            timestamp: block.timestamp,
            from: msg.sender,
            to: msg.sender,
            fromSite: fromSite,
            toSite: toSite,
            notes: notes
        }));
        emit TransferRecorded(id, msg.sender, fromSite, toSite);
    }

    function deliverToRecycler(string calldata uid, string calldata recyclerSite)
        external onlyRole(CARRIER_ROLE)
    {
        bytes32 id = _uidHash(uid);
        _requireExists(id);
        Ewaste storage d = devices[id];
        require(d.phase == Phase.Collected || d.phase == Phase.InTransit, "EW: wrong phase");
        d.phase = Phase.DeliveredToRecycler;

        history[id].push(TransferHop({
            timestamp: block.timestamp,
            from: msg.sender,
            to: address(0),
            fromSite: "Transit",
            toSite: recyclerSite,
            notes: "Delivered to recycler"
        }));
        emit Delivered(id, msg.sender, recyclerSite);
    }

    function processDevice(string calldata uid, ProcessKind kind)
        external onlyRole(RECYCLER_ROLE)
    {
        bytes32 id = _uidHash(uid);
        _requireExists(id);
        Ewaste storage d = devices[id];
        require(d.phase == Phase.DeliveredToRecycler, "EW: wrong phase");
        d.phase = Phase.Processed;

        if (kind == ProcessKind.Destroy) {
            d.state = DeviceState.Hazardous;
        }

        history[id].push(TransferHop({
            timestamp: block.timestamp,
            from: msg.sender,
            to: msg.sender,
            fromSite: "Recycler",
            toSite: "Processed",
            notes: kind == ProcessKind.Recycle ? "Recycled" : "Destroyed"
        }));
        emit Processed(id, msg.sender, kind);
    }

    function getDevice(string calldata uid) external view returns (Ewaste memory) {
        bytes32 id = _uidHash(uid);
        _requireExists(id);
        return devices[id];
    }
    function getHistory(string calldata uid) external view returns (TransferHop[] memory) {
        bytes32 id = _uidHash(uid);
        _requireExists(id);
        return history[id];
    }
    function exists(string calldata uid) external view returns (bool) {
        return devices[_uidHash(uid)].exists;
    }
}
