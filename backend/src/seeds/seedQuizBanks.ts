import { QuizBankModel } from "../models/quizBank.model.js";
import { QuizQuestionModel } from "../models/quizQuestion.model.js";
import { logger } from "../utils/logger.js";

interface SeedQuizBankData {
  slug: string;
  title: string;
  description: string;
  tier: "daily" | "weekly" | "phase_exam";
  canonicalId: string;
  phaseNumber?: number;
  durationMinutes: number;
  passThresholdPercentage: number;
  questions: Array<{
    questionText: string;
    options: string[];
    correctOptionIndex: number;
    explanation: string;
    difficulty: "beginner" | "intermediate" | "advanced";
  }>;
}

export const CANONICAL_QUIZ_BANKS: SeedQuizBankData[] = [
  {
    slug: "p1-w1-d1-quiz",
    title: "Daily Quiz: Protocol Foundations & Network Layers",
    description: "Verify your mastery of OSI layers, TCP handshake, HTTP/1.1 vs HTTP/2 multiplexing, and socket lifecycle.",
    tier: "daily",
    canonicalId: "p1-w1-d1",
    phaseNumber: 1,
    durationMinutes: 10,
    passThresholdPercentage: 75,
    questions: [
      {
        questionText: "What is the primary architectural advantage of HTTP/2 over HTTP/1.1 for high-throughput API services?",
        options: [
          "HTTP/2 introduces binary framed binary multiplexing over a single TCP connection, eliminating head-of-line blocking at the application layer.",
          "HTTP/2 removes TLS encryption requirements to achieve zero socket latency.",
          "HTTP/2 uses UDP datagrams exclusively to bypass kernel socket buffer limits.",
          "HTTP/2 enforces stateless text headers without compression to simplify load balancer parsing.",
        ],
        correctOptionIndex: 0,
        explanation: "HTTP/2 splits requests and responses into binary frames and interleaves them over a single persistent TCP connection, preventing HTTP-level head-of-line blocking.",
        difficulty: "intermediate",
      },
      {
        questionText: "In the standard TCP 3-way handshake, what is the exact packet flag sequence exchanged between client and server?",
        options: [
          "SYN -> SYN-ACK -> ACK",
          "SYN -> ACK -> SYN-ACK",
          "ACK -> SYN -> ACK-SYN",
          "FIN -> FIN-ACK -> ACK",
        ],
        correctOptionIndex: 0,
        explanation: "A TCP connection is established via SYN (client initiates), SYN-ACK (server acknowledges and synchronizes), and ACK (client final acknowledgment).",
        difficulty: "beginner",
      },
      {
        questionText: "Which TCP socket state does a server endpoint transition into after sending a FIN packet during graceful connection termination?",
        options: [
          "LAST-ACK (or FIN-WAIT-1 depending on active closer)",
          "SYN-RECEIVED",
          "ESTABLISHED",
          "LISTEN",
        ],
        correctOptionIndex: 0,
        explanation: "When closing a TCP connection, the side that initiates active close enters FIN-WAIT-1, while a passive closer that receives FIN and replies with FIN enters LAST-ACK.",
        difficulty: "advanced",
      },
      {
        questionText: "What is the key difference between OSI Layer 4 (Transport) and Layer 7 (Application) load balancing?",
        options: [
          "Layer 4 routes packets based on IP address and port without inspecting payload content, while Layer 7 inspects HTTP headers, paths, and cookies.",
          "Layer 4 only balances UDP traffic, while Layer 7 only balances TCP traffic.",
          "Layer 4 terminates TLS encryption, while Layer 7 routes raw binary packets transparently.",
          "Layer 4 requires application servers to share a distributed session store, while Layer 7 does not.",
        ],
        correctOptionIndex: 0,
        explanation: "Layer 4 proxies operate at TCP/UDP level without decrypting or parsing application payload; Layer 7 reverse proxies terminate TLS and inspect HTTP URIs, headers, and request bodies.",
        difficulty: "intermediate",
      },
      {
        questionText: "Why is UDP preferred over TCP for real-time multiplayer telemetry and VoIP streaming?",
        options: [
          "UDP is connectionless with no retransmission overhead or head-of-line blocking, prioritizing low latency over guaranteed packet delivery.",
          "UDP automatically encrypts all packets with hardware acceleration.",
          "UDP guarantees in-order packet delivery with zero memory buffer allocation.",
          "UDP bypasses the IP routing table entirely.",
        ],
        correctOptionIndex: 0,
        explanation: "UDP avoids acknowledgement handshakes and retransmission delays, ensuring minimal latency when dropped packets can simply be discarded in favor of newer updates.",
        difficulty: "beginner",
      },
    ],
  },
  {
    slug: "p1-w1-d2-quiz",
    title: "Daily Quiz: Process Architecture & Node.js Event Loop",
    description: "Test your understanding of the V8 engine, Libuv event loop phases, process memory segments, and worker threads.",
    tier: "daily",
    canonicalId: "p1-w1-d2",
    phaseNumber: 1,
    durationMinutes: 10,
    passThresholdPercentage: 75,
    questions: [
      {
        questionText: "In the Libuv event loop execution order, when are process.nextTick() microtasks executed relative to macro tasks?",
        options: [
          "Immediately after the current operation completes, before the event loop advances to the next phase.",
          "Only during the Check (setImmediate) phase.",
          "Only in the Timers phase after all setTimeout callbacks resolve.",
          "In the Close Callbacks phase at the very end of the tick.",
        ],
        correctOptionIndex: 0,
        explanation: "process.nextTick() callbacks are processed in the microtask queue right after the currently running operation completes, prior to moving to the next Libuv phase.",
        difficulty: "advanced",
      },
      {
        questionText: "Which process memory segment in a backend runtime stores dynamically allocated objects and reference types?",
        options: [
          "Heap Memory",
          "Call Stack",
          "Text / Code Segment",
          "BSS Segment",
        ],
        correctOptionIndex: 0,
        explanation: "The Heap is the unstructured memory pool used for dynamic memory allocation and objects managed by the Garbage Collector.",
        difficulty: "intermediate",
      },
      {
        questionText: "What is the primary difference between Node.js Worker Threads and child_process.fork()?",
        options: [
          "Worker Threads share memory within the same operating system process via SharedArrayBuffer, whereas child processes run with isolated V8 instances and separate memory spaces.",
          "Worker Threads cannot execute asynchronous JavaScript code.",
          "child_process.fork() only works on Windows operating systems.",
          "Worker Threads require a dedicated Redis message broker to communicate.",
        ],
        correctOptionIndex: 0,
        explanation: "Worker Threads execute in the same process and can share memory, whereas child_process creates a separate OS process with its own PID and isolated memory.",
        difficulty: "advanced",
      },
      {
        questionText: "How does the V8 Garbage Collector handle circular references between objects?",
        options: [
          "Through Mark-and-Sweep reachability analysis starting from GC Root references, collecting objects that are no longer reachable from the root.",
          "By counting reference pointers and failing with memory leaks on any circular graph.",
          "By immediately crashing the process with an unhandled exception.",
          "By writing circular objects to disk swap space.",
        ],
        correctOptionIndex: 0,
        explanation: "Modern V8 generational GC uses reachability algorithms (Mark-and-Sweep / Scavenge) from GC roots; unreachable circular subgraphs are cleanly collected.",
        difficulty: "intermediate",
      },
      {
        questionText: "What happens when synchronous CPU-heavy work (e.g. large JSON parsing or cryptography) runs on the main JavaScript thread?",
        options: [
          "The event loop is blocked, preventing all incoming network requests and timers from processing until the CPU work completes.",
          "Node.js automatically distributes the CPU work across all CPU cores in the background.",
          "The operating system terminates the process with SIGKILL.",
          "The requests are automatically queued inside MongoDB connection pools.",
        ],
        correctOptionIndex: 0,
        explanation: "Because JavaScript execution on Node's main thread is single-threaded, synchronous CPU tasks block the event loop from servicing network I/O.",
        difficulty: "beginner",
      },
    ],
  },
  {
    slug: "p1-week-1-assessment",
    title: "Week 1 Milestone Assessment: Backend Engineering Foundations",
    description: "Comprehensive 10-question evaluation covering protocol mechanics, sockets, event loops, and memory models.",
    tier: "weekly",
    canonicalId: "p1-w1",
    phaseNumber: 1,
    durationMinutes: 15,
    passThresholdPercentage: 75,
    questions: [
      {
        questionText: "What status code should an idempotent HTTP endpoint return when a DELETE request successfully removes a resource?",
        options: [
          "204 No Content (or 200 OK with response payload)",
          "201 Created",
          "301 Moved Permanently",
          "400 Bad Request",
        ],
        correctOptionIndex: 0,
        explanation: "HTTP 204 No Content signifies that the server successfully fulfilled the request and there is no additional content to send in the response payload.",
        difficulty: "beginner",
      },
      {
        questionText: "What is the function of the TCP TIME-WAIT state after active connection closure?",
        options: [
          "To allow lingering in-flight packets to expire in the network and ensure the remote host received the final ACK.",
          "To keep the TLS session alive for future HTTP requests.",
          "To buffer uncommitted database transactions.",
          "To reduce CPU utilization by disabling network interrupts.",
        ],
        correctOptionIndex: 0,
        explanation: "TIME-WAIT (usually 2MSL) prevents delayed duplicate packets from being misdelivered to a subsequent connection reusing the same socket 4-tuple.",
        difficulty: "advanced",
      },
      {
        questionText: "Which header enables HTTP Connection Keep-Alive in HTTP/1.0?",
        options: [
          "Connection: keep-alive",
          "Upgrade: websocket",
          "Transfer-Encoding: chunked",
          "Cache-Control: immutable",
        ],
        correctOptionIndex: 0,
        explanation: "In HTTP/1.0, persistent connections required the explicit `Connection: keep-alive` header (it became the default in HTTP/1.1).",
        difficulty: "intermediate",
      },
      {
        questionText: "How does HTTP/3 solve the transport-level head-of-line blocking problem present in HTTP/2?",
        options: [
          "By building on QUIC over UDP, allowing independent stream multiplexing where dropped packets only pause the affected stream.",
          "By eliminating TCP checksum verification.",
          "By compressing JSON bodies with Brotli.",
          "By replacing DNS lookup with peer-to-peer discovery.",
        ],
        correctOptionIndex: 0,
        explanation: "HTTP/3 replaces TCP with QUIC over UDP. Streams are independent at the transport layer, so packet loss on one stream does not stall other streams.",
        difficulty: "advanced",
      },
      {
        questionText: "What is the purpose of connection pooling in backend database drivers?",
        options: [
          "To reuse an established pool of open TCP/TLS sockets, avoiding the high latency of repeated handshakes for every database query.",
          "To automatically shard tables across multiple database clusters.",
          "To cache database query results in local process RAM.",
          "To prevent SQL injection attacks.",
        ],
        correctOptionIndex: 0,
        explanation: "Creating database connections is expensive (TCP handshake, TLS negotiation, authentication). A connection pool keeps open connections ready for immediate reuse.",
        difficulty: "intermediate",
      },
      {
        questionText: "Which Libuv phase handles I/O polling and events from operating system sockets (epoll / kqueue / IOCP)?",
        options: [
          "Poll phase",
          "Timers phase",
          "Check phase",
          "Close phase",
        ],
        correctOptionIndex: 0,
        explanation: "The Poll phase calculates how long it should block for I/O and retrieves new I/O events from the OS kernel.",
        difficulty: "intermediate",
      },
      {
        questionText: "What is the maximum number of concurrent open TCP connections a single IP address can theoretically establish to a single remote IP:port pair?",
        options: [
          "65,535 (limited by the 16-bit ephemeral source port range)",
          "1,024",
          "Unlimited without bound",
          "256",
        ],
        correctOptionIndex: 0,
        explanation: "Each TCP socket is identified by the 4-tuple (source IP, source Port, dest IP, dest Port). For a single source IP connecting to a fixed destination IP:port, there are at most 65,535 source ports available.",
        difficulty: "advanced",
      },
      {
        questionText: "What is an HTTP 429 status code?",
        options: [
          "Too Many Requests (Rate Limit Exceeded)",
          "Payment Required",
          "Method Not Allowed",
          "Gateway Timeout",
        ],
        correctOptionIndex: 0,
        explanation: "HTTP 429 Too Many Requests indicates the user has sent too many requests in a given amount of time (rate limited).",
        difficulty: "beginner",
      },
      {
        questionText: "In RESTful API design, which of the following HTTP methods is NOT idempotent?",
        options: [
          "POST",
          "GET",
          "PUT",
          "DELETE",
        ],
        correctOptionIndex: 0,
        explanation: "POST creates a new subordinate resource with each execution and is not idempotent, whereas GET, PUT, and DELETE produce the same side-effect regardless of repeated calls.",
        difficulty: "beginner",
      },
      {
        questionText: "What is the consequence of an unhandled Promise rejection in modern Node.js runtimes (Node 16+)?",
        options: [
          "The process terminates with a non-zero exit code unless an 'unhandledRejection' handler is attached.",
          "The runtime quietly logs a warning and continues running indefinitely.",
          "The runtime automatically retries the rejected Promise 3 times.",
          "The promise is sent to the operating system dead letter queue.",
        ],
        correctOptionIndex: 0,
        explanation: "Modern Node.js crashes the process on unhandled Promise rejections with a non-zero exit code to prevent running in an undefined or corrupted state.",
        difficulty: "intermediate",
      },
    ],
  },
  {
    slug: "phase-1-certification-exam",
    title: "Phase 1 Architecture Certification Exam",
    description: "Comprehensive 15-question certification exam for Phase 1 (Foundations & Systems Architecture). Passing with >=75% unlocks Phase 1 Mastery Certification.",
    tier: "phase_exam",
    canonicalId: "phase-1",
    phaseNumber: 1,
    durationMinutes: 20,
    passThresholdPercentage: 75,
    questions: [
      {
        questionText: "What is the primary trade-off of using a connection pool with size = 100 on a small 2-core backend server?",
        options: [
          "Context switching overhead on the database and memory consumption may degrade throughput compared to a smaller pool matching CPU core count.",
          "The database will automatically drop all queries after 10 connections.",
          "Network packets will experience TCP checksum corruption.",
          "TLS certificates cannot be shared across more than 10 sockets.",
        ],
        correctOptionIndex: 0,
        explanation: "Excessive pool sizes cause high thread concurrency and context switching on database engines, often lowering overall throughput compared to optimal pool sizing.",
        difficulty: "advanced",
      },
      {
        questionText: "Which structure does V8 use to represent object property layouts for high-speed access?",
        options: [
          "Hidden Classes (Shapes) and Inline Caching",
          "B-Trees in RAM",
          "Linked Lists",
          "Global Hash Map with String Keys",
        ],
        correctOptionIndex: 0,
        explanation: "V8 creates Hidden Classes (Shapes) to assign fixed memory offsets to object properties and uses Inline Caching (IC) to avoid repetitive dictionary lookups.",
        difficulty: "advanced",
      },
      {
        questionText: "How does backpressure operate in stream-based backend I/O?",
        options: [
          "When the consumer's buffer is full, write() returns false, signaling the producer to pause reading until the 'drain' event fires.",
          "The consumer drops incoming packets until the CPU cools down.",
          "The kernel automatically increases physical RAM allocation.",
          "Backpressure forces all stream data into synchronous disk files.",
        ],
        correctOptionIndex: 0,
        explanation: "Backpressure in Node.js streams halts the producer when internal highWaterMark buffers are saturated, resuming only when the consumer drains the buffer.",
        difficulty: "intermediate",
      },
      {
        questionText: "What is the primary vulnerability prevented by enforcing strict HTTP SameSite=Lax or Strict cookie attributes?",
        options: [
          "Cross-Site Request Forgery (CSRF)",
          "Cross-Site Scripting (XSS)",
          "SQL Injection",
          "Man-In-The-Middle packet sniffing",
        ],
        correctOptionIndex: 0,
        explanation: "SameSite attribute restricts browser cookie inclusion in cross-origin requests, defending against CSRF exploits.",
        difficulty: "intermediate",
      },
      {
        questionText: "In cryptographic password storage, why is a high cost factor (e.g., bcrypt cost 12 or Argon2id) essential?",
        options: [
          "It exponentially increases computational work required per attempt, making offline dictionary and GPU brute-force attacks infeasible.",
          "It compresses the password so it fits into an 8-byte database column.",
          "It allows the server to decrypt the plaintext password when the user forgets it.",
          "It bypasses database indexing locks.",
        ],
        correctOptionIndex: 0,
        explanation: "Key stretching algorithms enforce deliberate CPU and memory hardness to defeat massive parallelized hardware attacks.",
        difficulty: "intermediate",
      },
      {
        questionText: "What does the CAP Theorem state regarding distributed database systems during a network partition (P)?",
        options: [
          "The system must choose between Consistency (C) and Availability (A).",
          "The system can achieve Consistency, Availability, and Partition tolerance simultaneously if deployed on SSDs.",
          "The system will automatically switch to centralized SQLite.",
          "Partition tolerance is optional in distributed cloud networks.",
        ],
        correctOptionIndex: 0,
        explanation: "When a network partition occurs in a distributed system, you can either ensure every node returns the most recent data (Consistency) or ensure every node returns a response (Availability), but not both.",
        difficulty: "intermediate",
      },
      {
        questionText: "Why should JSON Web Tokens (JWT) access tokens have short expiration times (e.g., 15 minutes)?",
        options: [
          "Because JWTs are self-contained and stateless, meaning compromised access tokens cannot be revoked before expiration without maintaining a revocation blacklist.",
          "Because JWT signatures expire naturally due to clock drift.",
          "Because browsers delete localStorage after 15 minutes.",
          "Because HTTP headers cannot carry tokens longer than 15 minutes.",
        ],
        correctOptionIndex: 0,
        explanation: "Stateless verification means the server cannot unilaterally invalidate an issued JWT without external state; short lifetimes minimize the exposure window if a token leaks.",
        difficulty: "intermediate",
      },
      {
        questionText: "Which header is used by reverse proxies (e.g. NGINX, Cloudflare) to pass the original client IP to upstream application servers?",
        options: [
          "X-Forwarded-For",
          "X-Client-Protocol",
          "Content-Security-Policy",
          "Strict-Transport-Security",
        ],
        correctOptionIndex: 0,
        explanation: "The `X-Forwarded-For` header contains a comma-separated list of IP addresses representing the client and proxies through which the request traveled.",
        difficulty: "beginner",
      },
      {
        questionText: "What is the computational complexity of searching a unique indexed column backed by a B-Tree in MongoDB or PostgreSQL?",
        options: [
          "O(log N)",
          "O(1)",
          "O(N)",
          "O(N^2)",
        ],
        correctOptionIndex: 0,
        explanation: "B-Tree index lookups traverse a balanced tree structure with logarithmic O(log N) search complexity.",
        difficulty: "beginner",
      },
      {
        questionText: "How does the N+1 query problem typically manifest in backend database access layers?",
        options: [
          "Executing 1 initial query to fetch a parent list, followed by N individual queries in a loop to fetch child associations for each parent record.",
          "Executing a query with N+1 JOIN statements.",
          "Querying a database that has N+1 replica nodes.",
          "Using N+1 parallel database connection pools.",
        ],
        correctOptionIndex: 0,
        explanation: "The N+1 problem occurs when fetching N items causes N additional queries to fetch related entities rather than batching them into a single query.",
        difficulty: "intermediate",
      },
      {
        questionText: "What is the purpose of HTTP ETags (Entity Tags)?",
        options: [
          "Providing a unique cache identifier/hash for a resource version to enable conditional requests (If-None-Match -> 304 Not Modified).",
          "Tagging the developer who wrote the endpoint.",
          "Encrypting the HTTP body payload.",
          "Enforcing CORS origin whitelisting.",
        ],
        correctOptionIndex: 0,
        explanation: "ETags allow clients to validate whether their cached representation is still current without transferring the full response body again.",
        difficulty: "intermediate",
      },
      {
        questionText: "In Linux process management, what is a 'Zombie Process'?",
        options: [
          "A process that has completed execution but still has an entry in the process table because its parent has not yet read its exit status via wait().",
          "A process infected with malware.",
          "A background daemon process that never terminates.",
          "A process running with root privileges.",
        ],
        correctOptionIndex: 0,
        explanation: "A zombie process has finished execution and released its memory, but retains its PID in the kernel process table until the parent process calls `wait()`.",
        difficulty: "advanced",
      },
      {
        questionText: "What is the main benefit of zero-copy I/O (e.g., sendfile syscall) in high-performance web servers?",
        options: [
          "Data is transferred directly between file descriptor buffers in kernel space without copying bytes back and forth into user-space memory.",
          "It compresses files with zero CPU utilization.",
          "It eliminates the need for network interface controllers.",
          "It ensures 100% database cache hit ratios.",
        ],
        correctOptionIndex: 0,
        explanation: "Zero-copy avoids moving data between kernel buffers and user-space memory buffers when transferring files directly to network sockets.",
        difficulty: "advanced",
      },
      {
        questionText: "What mechanism allows a single Node.js process to listen on a port and handle tens of thousands of concurrent idle sockets without allocating a thread per socket?",
        options: [
          "Asynchronous non-blocking I/O multiplexing with event loops (epoll/kqueue).",
          "Creating 10,000 OS threads in parallel.",
          "Writing all socket data into disk files.",
          "Using synchronous busy-wait loops on every socket.",
        ],
        correctOptionIndex: 0,
        explanation: "Event-driven socket multiplexing lets the OS notify the process when data arrives on any socket, avoiding thread-per-connection memory and context-switching overhead.",
        difficulty: "intermediate",
      },
      {
        questionText: "Which HTTP header enforces that a browser must only communicate with a domain via HTTPS for a specified duration?",
        options: [
          "Strict-Transport-Security (HSTS)",
          "Content-Security-Policy",
          "X-Frame-Options",
          "Access-Control-Allow-Origin",
        ],
        correctOptionIndex: 0,
        explanation: "HSTS (`Strict-Transport-Security: max-age=...`) instructs browsers to automatically transform all HTTP requests to HTTPS before sending them.",
        difficulty: "intermediate",
      },
    ],
  },
];

export async function seedQuizBanks(): Promise<void> {
  for (const bankData of CANONICAL_QUIZ_BANKS) {
    const { questions, ...bankFields } = bankData;

    // 1. Upsert Quiz Bank
    const bankDoc = await QuizBankModel.findOneAndUpdate(
      { slug: bankFields.slug },
      { $set: bankFields },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    // 2. Clear old questions and insert updated questions for bank
    await QuizQuestionModel.deleteMany({ quizBankId: bankDoc._id });

    const questionDocs = questions.map((q, idx) => ({
      quizBankId: bankDoc._id,
      canonicalId: bankFields.canonicalId,
      questionText: q.questionText,
      options: q.options,
      correctOptionIndex: q.correctOptionIndex,
      explanation: q.explanation,
      difficulty: q.difficulty,
      order: idx + 1,
    }));

    await QuizQuestionModel.insertMany(questionDocs);
  }

  logger.info(
    { bankCount: CANONICAL_QUIZ_BANKS.length },
    "Quiz banks & questions seeded successfully",
  );
}
