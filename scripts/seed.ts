import "dotenv/config";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "../src/db/schema";
import * as fs from "fs";
import * as path from "path";

const dbPath = process.env.DATABASE_PATH || "./data/skillstreak.db";

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
const db = drizzle(sqlite, { schema });

const main = () => {
  try {
    console.log("🌱 Seeding database...");
    console.log(`📁 Database path: ${dbPath}`);

    console.log("Clearing existing data...");
    db.delete(schema.challengeProgress).run();
    db.delete(schema.challengeOptions).run();
    db.delete(schema.challenges).run();
    db.delete(schema.lessons).run();
    db.delete(schema.unitProgress).run();
    db.delete(schema.resumeBullets).run();
    db.delete(schema.skillProgress).run();
    db.delete(schema.userProgress).run();
    db.delete(schema.units).run();
    db.delete(schema.users).run();

    console.log("Creating units...");

    const unit1 = db
      .insert(schema.units)
      .values({
        title: "Foundation: DSA Fundamentals",
        description: "Master core data structures and algorithms for coding interviews",
        order: 1,
        iconEmoji: "💻",
        color: "#58cc02",
        capstoneProject: "Implement LRU Cache from scratch",
        capstoneResumeBullet: "Implemented production-grade LRU cache with O(1) operations in Go",
        resumeScoreBonus: 2,
      })
      .returning()
      .get();

    const unit2 = db
      .insert(schema.units)
      .values({
        title: "Kubernetes Fundamentals",
        description: "Build a strong foundation in Kubernetes for the CKA exam",
        order: 2,
        iconEmoji: "☸️",
        color: "#326ce5",
        prerequisiteUnitId: unit1.id,
        capstoneProject: "Deploy multi-tier app with K8s manifests",
        capstoneResumeBullet: "Architected and deployed production Kubernetes workloads with RBAC, NetworkPolicies, and resource management",
        resumeScoreBonus: 3,
      })
      .returning()
      .get();

    const unit3 = db
      .insert(schema.units)
      .values({
        title: "System Design Essentials",
        description: "Learn systematic approaches to system design interviews",
        order: 3,
        iconEmoji: "🏗️",
        color: "#ce82ff",
        prerequisiteUnitId: unit2.id,
        capstoneProject: "Design a URL shortener end-to-end",
        capstoneResumeBullet: "Designed and documented scalable distributed systems handling 100K+ requests/second",
        resumeScoreBonus: 3,
      })
      .returning()
      .get();

    const unit4 = db
      .insert(schema.units)
      .values({
        title: "AI Infrastructure",
        description: "Master LLM serving, GPU scheduling, and ML infrastructure",
        order: 4,
        iconEmoji: "🤖",
        color: "#ff4b4b",
        prerequisiteUnitId: unit3.id,
        capstoneProject: "Deploy vLLM on Kubernetes with autoscaling",
        capstoneResumeBullet: "Built GPU-optimized LLM serving infrastructure with vLLM achieving 2x throughput improvement",
        resumeScoreBonus: 4,
      })
      .returning()
      .get();

    const unit5 = db
      .insert(schema.units)
      .values({
        title: "Advanced Kubernetes & CKA",
        description: "Deep dive into K8s internals and CKA exam preparation",
        order: 5,
        iconEmoji: "🎓",
        color: "#ff9600",
        prerequisiteUnitId: unit4.id,
        capstoneProject: "Build a Kubernetes Operator in Go",
        capstoneResumeBullet: "Developed custom Kubernetes operator in Go managing complex stateful workloads",
        resumeScoreBonus: 4,
      })
      .returning()
      .get();

    console.log("Creating lessons and challenges...");

    const lesson1 = db
      .insert(schema.lessons)
      .values({
        unitId: unit1.id,
        title: "Big-O Complexity",
        description: "Understanding time and space complexity analysis",
        order: 1,
        sourceRepo: "jwasham/coding-interview-university",
        sourceUrl: "https://github.com/jwasham/coding-interview-university#algorithmic-complexity--big-o--asymptotic-analysis",
        estimatedMinutes: 15,
        xpReward: 50,
      })
      .returning()
      .get();

    const c1 = db
      .insert(schema.challenges)
      .values({
        lessonId: lesson1.id,
        type: "SELECT",
        skillTrack: "coding",
        difficulty: "foundation",
        question: "What is the time complexity of finding an element in a balanced Binary Search Tree?",
        order: 1,
        xpReward: 10,
        explanation: "In a balanced BST, each comparison eliminates half of the remaining nodes, giving us O(log n). This is why BSTs are preferred over linked lists for search operations.",
        sourceRepo: "jwasham/coding-interview-university",
        tags: ["big-o", "bst", "data-structures"],
      })
      .returning()
      .get();

    db.insert(schema.challengeOptions).values([
      { challengeId: c1.id, text: "O(1)", correct: false, order: 1 },
      { challengeId: c1.id, text: "O(log n)", correct: true, order: 2 },
      { challengeId: c1.id, text: "O(n)", correct: false, order: 3 },
      { challengeId: c1.id, text: "O(n log n)", correct: false, order: 4 },
    ]).run();

    const c2 = db
      .insert(schema.challenges)
      .values({
        lessonId: lesson1.id,
        type: "SELECT",
        skillTrack: "coding",
        difficulty: "foundation",
        question: "What is the space complexity of a recursive Fibonacci function without memoization?",
        order: 2,
        xpReward: 10,
        explanation: "The recursion depth is O(n) for fib(n), and each call adds a frame to the call stack, giving O(n) space complexity.",
        sourceRepo: "neetcode-gh/leetcode",
        tags: ["recursion", "space-complexity"],
      })
      .returning()
      .get();

    db.insert(schema.challengeOptions).values([
      { challengeId: c2.id, text: "O(1)", correct: false, order: 1 },
      { challengeId: c2.id, text: "O(n)", correct: true, order: 2 },
      { challengeId: c2.id, text: "O(2^n)", correct: false, order: 3 },
      { challengeId: c2.id, text: "O(n^2)", correct: false, order: 4 },
    ]).run();

    const lesson2 = db
      .insert(schema.lessons)
      .values({
        unitId: unit1.id,
        title: "Hash Tables Deep Dive",
        description: "Master hash table internals and common patterns",
        order: 2,
        sourceRepo: "donnemartin/system-design-primer",
        sourceUrl: "https://github.com/donnemartin/system-design-primer#hash-table",
        estimatedMinutes: 20,
        xpReward: 60,
      })
      .returning()
      .get();

    db.insert(schema.challenges)
      .values({
        lessonId: lesson2.id,
        type: "FREE_TEXT",
        skillTrack: "coding",
        difficulty: "foundation",
        question: "Implement the Two Sum problem: Given an array of integers and a target sum, return indices of the two numbers that add up to target.",
        content: `Example:
Input: nums = [2, 7, 11, 15], target = 9
Output: [0, 1] (because nums[0] + nums[1] = 9)

Write your solution in Python:`,
        order: 1,
        xpReward: 25,
        modelAnswer: `def two_sum(nums: list[int], target: int) -> list[int]:
    seen = {}  # value -> index
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Time: O(n), Space: O(n)
# Key insight: Use a hash map to store seen values
# and check for complements in O(1) time.`,
        explanation: "The hash map approach is O(n) time and space. The brute force O(n²) checks every pair. Always mention the trade-off: we use extra space to gain speed.",
        sourceRepo: "neetcode-gh/leetcode",
        tags: ["hash-map", "arrays", "two-pointers"],
      })
      .run();

    const lesson3 = db
      .insert(schema.lessons)
      .values({
        unitId: unit2.id,
        title: "Kubernetes Architecture",
        description: "Understanding K8s control plane and node components",
        order: 1,
        sourceRepo: "walidshaari/Kubernetes-Certified-Administrator",
        sourceUrl: "https://github.com/walidshaari/Kubernetes-Certified-Administrator",
        estimatedMinutes: 20,
        xpReward: 55,
      })
      .returning()
      .get();

    const c4 = db
      .insert(schema.challenges)
      .values({
        lessonId: lesson3.id,
        type: "SELECT",
        skillTrack: "kubernetes",
        difficulty: "foundation",
        question: "Which component is responsible for assigning Pods to Nodes in Kubernetes?",
        order: 1,
        xpReward: 10,
        explanation: "The kube-scheduler watches for newly created Pods without an assigned node and selects a node based on resource requirements, constraints, affinity rules, and other policies.",
        sourceRepo: "kelseyhightower/kubernetes-the-hard-way",
        tags: ["kubernetes", "scheduling", "control-plane"],
      })
      .returning()
      .get();

    db.insert(schema.challengeOptions).values([
      { challengeId: c4.id, text: "kubelet", correct: false, order: 1 },
      { challengeId: c4.id, text: "kube-proxy", correct: false, order: 2 },
      { challengeId: c4.id, text: "kube-scheduler", correct: true, order: 3 },
      { challengeId: c4.id, text: "etcd", correct: false, order: 4 },
    ]).run();

    const c5 = db
      .insert(schema.challenges)
      .values({
        lessonId: lesson3.id,
        type: "SELECT",
        skillTrack: "kubernetes",
        difficulty: "foundation",
        question: "What consensus algorithm does etcd use for data consistency?",
        order: 2,
        xpReward: 10,
        explanation: "etcd uses Raft for leader election and log replication. Requires majority (n/2+1) for writes. For 3-node cluster, tolerates 1 failure.",
        sourceRepo: "kelseyhightower/kubernetes-the-hard-way",
        tags: ["etcd", "consensus", "raft"],
      })
      .returning()
      .get();

    db.insert(schema.challengeOptions).values([
      { challengeId: c5.id, text: "Paxos", correct: false, order: 1 },
      { challengeId: c5.id, text: "Raft", correct: true, order: 2 },
      { challengeId: c5.id, text: "Two-Phase Commit", correct: false, order: 3 },
      { challengeId: c5.id, text: "Gossip Protocol", correct: false, order: 4 },
    ]).run();

    const lesson4 = db
      .insert(schema.lessons)
      .values({
        unitId: unit3.id,
        title: "System Design Process",
        description: "Learn the systematic approach to system design interviews",
        order: 1,
        sourceRepo: "donnemartin/system-design-primer",
        sourceUrl: "https://github.com/donnemartin/system-design-primer#how-to-approach-a-system-design-interview-question",
        estimatedMinutes: 25,
        xpReward: 65,
      })
      .returning()
      .get();

    const c6 = db
      .insert(schema.challenges)
      .values({
        lessonId: lesson4.id,
        type: "SELECT",
        skillTrack: "system-design",
        difficulty: "foundation",
        question: "In the CAP theorem, since network partitions are unavoidable, what trade-off are you really making?",
        order: 1,
        xpReward: 15,
        explanation: "Since P (partition tolerance) is required for distributed systems, you're choosing between C (consistency) and A (availability). Banking prefers CP, social feeds prefer AP.",
        sourceRepo: "donnemartin/system-design-primer",
        tags: ["cap-theorem", "distributed-systems"],
      })
      .returning()
      .get();

    db.insert(schema.challengeOptions).values([
      { challengeId: c6.id, text: "Between Consistency and Availability", correct: true, order: 1 },
      { challengeId: c6.id, text: "Between Speed and Storage", correct: false, order: 2 },
      { challengeId: c6.id, text: "Between Cost and Performance", correct: false, order: 3 },
      { challengeId: c6.id, text: "All three can be achieved", correct: false, order: 4 },
    ]).run();

    const lesson5 = db
      .insert(schema.lessons)
      .values({
        unitId: unit4.id,
        title: "LLM Inference Basics",
        description: "Understanding GPU memory, batching, and vLLM optimizations",
        order: 1,
        sourceRepo: "vllm-project/vllm",
        sourceUrl: "https://github.com/vllm-project/vllm",
        estimatedMinutes: 25,
        xpReward: 70,
      })
      .returning()
      .get();

    const c7 = db
      .insert(schema.challenges)
      .values({
        lessonId: lesson5.id,
        type: "SELECT",
        skillTrack: "ai-infra",
        difficulty: "intermediate",
        question: "What is the main innovation of vLLM for LLM inference?",
        order: 1,
        xpReward: 15,
        explanation: "vLLM's PagedAttention manages attention key-value cache like virtual memory pages, reducing memory waste from 60-80% to near zero. This enables higher throughput and larger batch sizes.",
        sourceRepo: "vllm-project/vllm",
        tags: ["vllm", "paged-attention", "inference"],
      })
      .returning()
      .get();

    db.insert(schema.challengeOptions).values([
      { challengeId: c7.id, text: "Using CPUs instead of GPUs", correct: false, order: 1 },
      { challengeId: c7.id, text: "PagedAttention for efficient memory management", correct: true, order: 2 },
      { challengeId: c7.id, text: "Smaller model architectures", correct: false, order: 3 },
      { challengeId: c7.id, text: "Removing the attention mechanism", correct: false, order: 4 },
    ]).run();

    const c8 = db
      .insert(schema.challenges)
      .values({
        lessonId: lesson5.id,
        type: "SELECT",
        skillTrack: "ai-infra",
        difficulty: "intermediate",
        question: "What does continuous batching solve in LLM serving?",
        order: 2,
        xpReward: 15,
        explanation: "Static batching waits for all requests in a batch to complete. Continuous batching adds new requests as soon as any finishes, maximizing GPU utilization.",
        sourceRepo: "stas00/ml-engineering",
        tags: ["batching", "inference", "throughput"],
      })
      .returning()
      .get();

    db.insert(schema.challengeOptions).values([
      { challengeId: c8.id, text: "Reduces model size", correct: false, order: 1 },
      { challengeId: c8.id, text: "Improves GPU utilization by not waiting for slowest request", correct: true, order: 2 },
      { challengeId: c8.id, text: "Enables distributed training", correct: false, order: 3 },
      { challengeId: c8.id, text: "Encrypts model weights", correct: false, order: 4 },
    ]).run();

    console.log("✅ Database seeded successfully!");
    console.log(`
Created:
- 5 Units
- 5 Lessons
- 8 Challenges with options

The curriculum is grounded in these GitHub resources:
- jwasham/coding-interview-university
- donnemartin/system-design-primer
- neetcode-gh/leetcode
- walidshaari/Kubernetes-Certified-Administrator
- kelseyhightower/kubernetes-the-hard-way
- vllm-project/vllm
- stas00/ml-engineering
`);
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    sqlite.close();
  }
};

main();
