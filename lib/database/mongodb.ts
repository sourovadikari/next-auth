import { MongoClient, Db } from 'mongodb';

// Declare a global type for the MongoDB client promise to avoid TypeScript errors
// This extends the NodeJS.Global interface and MUST be at the top level.
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Ensure your MongoDB connection string is in your .env.local file
// Example: MONGODB_URI="mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority"
const uri: string | undefined = process.env.MONGODB_URI;
const dbName: string | undefined = process.env.MONGODB_DB_NAME;

// Critical check: Ensure URI is defined at build/runtime
if (!uri) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local or .env'
  );
}

// Critical check: Ensure DB Name is defined
if (!dbName) {
  throw new Error(
    'Please define the MONGODB_DB_NAME environment variable inside .env.local or .env'
  );
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// In development, we use a global variable to cache the MongoClient promise.
// This prevents the creation of multiple connections during hot module replacement (HMR),
// which can lead to connection leaks and performance issues.
// In production, a new MongoClient instance is created on each module load.
// This ensures that connections are managed properly in a serverless environment
// where modules might be reloaded less frequently or in different contexts.
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, do not use a global variable.
  // A new client is created and connected each time this module is imported.
  // This is generally safe in serverless environments where modules are often
  // cold-started per request or container.
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

/**
 * Connects to the MongoDB database and returns the database instance.
 * This function should be called within your API routes to interact with the database.
 * It leverages a shared clientPromise to ensure efficient connection management.
 * @returns {Promise<Db>} The MongoDB database instance.
 * @throws {Error} If the database connection fails or MONGODB_DB_NAME is not defined.
 */
export async function connectToDatabase(): Promise<Db> {
  try {
    const connectedClient = await clientPromise;
    // Use the database name from environment variables.
    // The `dbName` variable is already checked at the top of the file.
    return connectedClient.db(dbName);
  } catch (error: unknown) { // Use 'unknown' for caught errors for better type safety
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during database connection.";
    console.error('Failed to connect to MongoDB:', errorMessage, error); // Log the full error
    throw new Error('Database connection failed: Could not establish connection to MongoDB.');
  }
}

// Export the clientPromise for direct use if needed in specific scenarios
// (e.g., for advanced operations that require the MongoClient instance itself).
export default clientPromise;
