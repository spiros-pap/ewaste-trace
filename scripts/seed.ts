import { ethers } from "hardhat";

function arg(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

async function main() {
  const REGISTRY = arg("REGISTRY");
  const signers = await ethers.getSigners();

  const admin     = signers[0];
  const user      = signers[1];
  const green     = signers[2];
  const carrier   = signers[3];
  const recycler  = signers[4];
  const inspector = signers[5];

  const registry = await ethers.getContractAt("EwasteRegistry", REGISTRY, admin);

  const ADMIN_ROLE       = await registry.ADMIN_ROLE();
  const USER_ROLE        = await registry.USER_ROLE();
  const GREEN_POINT_ROLE = await registry.GREEN_POINT_ROLE();
  const CARRIER_ROLE     = await registry.CARRIER_ROLE();
  const RECYCLER_ROLE    = await registry.RECYCLER_ROLE();
  const INSPECTOR_ROLE   = await registry.INSPECTOR_ROLE();

  // grant roles
  await (await registry.registerUser(user.address, USER_ROLE)).wait();
  await (await registry.registerUser(green.address, GREEN_POINT_ROLE)).wait();
  await (await registry.registerUser(carrier.address, CARRIER_ROLE)).wait();
  await (await registry.registerUser(recycler.address, RECYCLER_ROLE)).wait();
  await (await registry.registerUser(inspector.address, INSPECTOR_ROLE)).wait();

  const asUser     = registry.connect(user);
  const asGreen    = registry.connect(green);
  const asCarrier  = registry.connect(carrier);
  const asRecycler = registry.connect(recycler);

  // 10 devices
  const categories = ["laptop","tablet","mobile","monitor","desktop"];
  const hazards = [0,1,2];      // Low, Medium, High
  const states  = [0,1,2];      // Functional, Damaged, Hazardous

  for (let i = 0; i < 10; i++) {
    const uid = `DEV-${1000 + i}`;
    await (await asUser.registerDevice(
      uid,
      categories[i % categories.length],
      hazards[i % hazards.length],
      states[i % states.length]
    )).wait();
  }

  // Route #1: DEV-1000
  await (await asGreen.confirmCollection("DEV-1000", "GreenPoint-A")).wait();
  await (await asCarrier.recordTransfer("DEV-1000", "GreenPoint-A", "Hub-1", "Leg 1")).wait();
  await (await asCarrier.recordTransfer("DEV-1000", "Hub-1", "Recycler-X", "Leg 2")).wait();
  await (await asCarrier.deliverToRecycler("DEV-1000", "Recycler-X")).wait();
  await (await asRecycler.processDevice("DEV-1000", 0 /* Recycle */)).wait();

  // Route #2: DEV-1001
  await (await asGreen.confirmCollection("DEV-1001", "GreenPoint-B")).wait();
  await (await asCarrier.deliverToRecycler("DEV-1001", "Recycler-Y")).wait();
  await (await asRecycler.processDevice("DEV-1001", 1 /* Destroy */)).wait();

  console.log("Seed complete: roles set, 10 devices, 2 full routes.");
}

main().catch((e) => { console.error(e); process.exit(1); });
