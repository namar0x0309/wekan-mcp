// made by namar0x0309 with ❤️ at GoAIX
import { request } from "undici";

export interface WekanLoginResponse {
  id: string;
  token: string;
  tokenExpires: string;
}

export type WekanClientOpts = { 
  baseUrl: string; 
  token?: string;
  username?: string;
  password?: string;
};

// Wekan API response types
export interface WekanBoard {
  _id: string;
  title: string;
  [key: string]: any;
}

export interface WekanList {
  _id: string;
  title: string;
  [key: string]: any;
}

export interface WekanSwimlane {
  _id: string;
  title: string;
  [key: string]: any;
}

export interface WekanCard {
  _id: string;
  title: string;
  description?: string;
  listId?: string;
  swimlaneId?: string;
  [key: string]: any;
}

export interface WekanComment {
  _id: string;
  [key: string]: any;
}

export class Wekan {
  private token: string | null = null;
  
  constructor(private opts: WekanClientOpts) {}
  
  private async authenticate(): Promise<string> {
    // If we already have a token, use it
    if (this.opts.token) {
      return this.opts.token;
    }
    
    // If we have username/password, login to get token
    if (this.opts.username && this.opts.password) {
      const r = await request(`${this.opts.baseUrl}/users/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          username: this.opts.username,
          password: this.opts.password
        })
      });
      
      if (r.statusCode >= 400) {
        throw new Error(`Login failed -> ${r.statusCode}`);
      }
      
      const loginResponse = await r.body.json() as WekanLoginResponse;
      this.token = loginResponse.token;
      return this.token;
    }
    
    throw new Error("No authentication method provided. Set WEKAN_API_TOKEN or WEKAN_USERNAME/WEKAN_PASSWORD");
  }

  private async headers() { 
    const token = await this.authenticate();
    return { Authorization: `Bearer ${token}` }; 
  }

  private async requestWithAuth(path: string, options: any): Promise<any> {
    const headers = await this.headers();
    const r = await request(`${this.opts.baseUrl}${path}`, {
      ...options,
      headers: { ...headers, ...options.headers }
    });
    
    if (r.statusCode >= 400) {
      throw new Error(`${options.method || 'GET'} ${path} -> ${r.statusCode}`);
    }
    
    return r.body.json();
  }

  async get(path: string): Promise<any> {
    return this.requestWithAuth(path, { method: "GET" });
  }
  
  async post(path: string, body: unknown): Promise<any> {
    return this.requestWithAuth(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body ?? {})
    });
  }
  
  async put(path: string, body: unknown): Promise<any> {
    return this.requestWithAuth(path, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body ?? {})
    });
  }

  // API surface
  listBoards(): Promise<WekanBoard[]> { return this.get(`/api/boards`); }
  listLists(boardId: string): Promise<WekanList[]> { return this.get(`/api/boards/${boardId}/lists`); }
  listSwimlanes(boardId: string): Promise<WekanSwimlane[]> { return this.get(`/api/boards/${boardId}/swimlanes`); }
  listCards(boardId: string, listId: string): Promise<WekanCard[]> { return this.get(`/api/boards/${boardId}/lists/${listId}/cards`); }
  createCard(boardId: string, listId: string, body: any): Promise<WekanCard> { return this.post(`/api/boards/${boardId}/lists/${listId}/cards`, body); }
  moveCard(boardId: string, cardId: string, body: any): Promise<WekanCard> { return this.put(`/api/boards/${boardId}/cards/${cardId}`, body); }
  commentCard(boardId: string, cardId: string, text: string): Promise<WekanComment> { return this.post(`/api/boards/${boardId}/cards/${cardId}/comments`, { text }); }
}
