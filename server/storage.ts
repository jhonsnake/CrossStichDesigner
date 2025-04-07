import { patterns, users, type User, type InsertUser, type Pattern, type InsertPattern } from "@shared/schema";
import path from "path";
import fs from "fs";

// Interface for storage operations
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Pattern operations
  savePattern(pattern: InsertPattern): Promise<Pattern>;
  getPattern(id: number): Promise<Pattern | undefined>;
  getPatternsByUserId(userId: number): Promise<Pattern[]>;
  saveUploadedImage(fileBuffer: Buffer, fileName: string): Promise<string>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private patterns: Map<number, Pattern>;
  private uploadsDir: string;
  private userCurrentId: number;
  private patternCurrentId: number;

  constructor() {
    this.users = new Map();
    this.patterns = new Map();
    this.userCurrentId = 1;
    this.patternCurrentId = 1;
    
    // Create uploads directory if it doesn't exist
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async savePattern(insertPattern: InsertPattern): Promise<Pattern> {
    const id = this.patternCurrentId++;
    const createdAt = new Date().toISOString();
    const pattern: Pattern = { ...insertPattern, id, createdAt };
    this.patterns.set(id, pattern);
    return pattern;
  }

  async getPattern(id: number): Promise<Pattern | undefined> {
    return this.patterns.get(id);
  }

  async getPatternsByUserId(userId: number): Promise<Pattern[]> {
    return Array.from(this.patterns.values()).filter(
      (pattern) => pattern.userId === userId,
    );
  }

  async saveUploadedImage(fileBuffer: Buffer, fileName: string): Promise<string> {
    const uniqueFilename = `${Date.now()}-${fileName}`;
    const filePath = path.join(this.uploadsDir, uniqueFilename);
    
    await fs.promises.writeFile(filePath, fileBuffer);
    
    return `/uploads/${uniqueFilename}`;
  }
}

export const storage = new MemStorage();
