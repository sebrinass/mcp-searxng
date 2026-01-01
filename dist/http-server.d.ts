import express from "express";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
export declare function createHttpServer(server: Server): Promise<express.Application>;
