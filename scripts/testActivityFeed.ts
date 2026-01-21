// Test Script for Activity Feed Logic
// Run with: npx tsx scripts/testActivityFeed.ts

import { ActivityService, ActivityItem } from '../src/services/ActivityService';

async function runTest() {
  console.log("🚀 Starting Activity Feed Simulation...\n");

  const userAddress = "0x" + "a".repeat(40); // User Address

  console.log(`👤 User: ${userAddress.substring(0, 8)}...`);

  // 1. Initial State Check
  let activities = await ActivityService.getActivities(userAddress);
  console.log(`\n[Initial] Activities: ${activities.length}`);

  // 2. Inject Test Data (Simulating Chain Events)
  console.log(`\n🔄 Injecting 4 test transactions...`);

  const tx1: Omit<ActivityItem, 'id' | 'timestamp'> = {
      type: "Send",
      asset: "USDT",
      amount: "50.00",
      status: "Success",
      date: "Today, 10:23 AM",
      hash: "0x123..."
  };

  const tx2: Omit<ActivityItem, 'id' | 'timestamp'> = {
      type: "Receive",
      asset: "BNB",
      amount: "0.50",
      status: "Success",
      date: "Yesterday, 4:15 PM",
      hash: "0x456..."
  };

  const tx3: Omit<ActivityItem, 'id' | 'timestamp'> = {
      type: "Swap",
      asset: "0.1 BNB -> USDT", // Keeping asset string format from UI requirement for now, though structure could be better
      amount: "0.1 BNB",
      status: "Pending",
      date: "Yesterday, 4:10 PM",
      hash: "0x789..."
  };

  const tx4: Omit<ActivityItem, 'id' | 'timestamp'> = {
      type: "Contract",
      asset: "Approve",
      amount: "Approve", // Reusing amount field for action text as per UI pattern
      status: "Success",
      date: "Jan 18, 9:00 AM",
      hash: "0xabc..."
  };

  await ActivityService.addActivity(userAddress, tx4); // Oldest first added (stack logic: unshift puts it at top, so let's add oldest last if unshift? No, service uses unshift, so newest added appears first)
  // Wait a bit to ensure timestamp diffs
  await new Promise(r => setTimeout(r, 10));
  await ActivityService.addActivity(userAddress, tx3);
  await new Promise(r => setTimeout(r, 10));
  await ActivityService.addActivity(userAddress, tx2);
  await new Promise(r => setTimeout(r, 10));
  await ActivityService.addActivity(userAddress, tx1); // Newest

  console.log("✅ Injection complete.");

  // 3. Fetch and Verify
  console.log(`\n📡 Fetching updated activities...`);
  activities = await ActivityService.getActivities(userAddress);
  
  console.log(`[Result] Total Activities: ${activities.length} (Expected: 4)`);
  
  if (activities.length !== 4) {
      console.error("❌ Count mismatch!");
      return;
  }

  // 4. Validate Specific Entries
  const latest = activities[0];
  console.log(`\n[Latest Activity] Type: ${latest.type}, Amount: ${latest.amount} (Expected: Send, 50.00)`);
  
  if (latest.type === "Send" && latest.amount === "50.00") {
      console.log("✅ Latest activity matches.");
  } else {
      console.error("❌ Latest activity mismatch.");
  }

  const pendingSwap = activities.find(a => a.type === "Swap");
  if (pendingSwap && pendingSwap.status === "Pending") {
       console.log("✅ Pending Swap found correctly.");
  } else {
       console.error("❌ Pending Swap not found or status wrong.");
  }

  console.log("\n✨ Activity Feed Simulation Complete!");
}

runTest().catch(console.error);
