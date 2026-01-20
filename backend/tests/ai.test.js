import request from 'supertest';
import app from '../src/index.js';
import mongoose from 'mongoose';

// Mock the LLM Client to avoid calling OpenAI during tests
jest.mock('../src/lib/llmClient.js', () => ({
    generateCompletion: jest.fn().mockResolvedValue(JSON.stringify({
        summary: ["Mock Summary Point 1", "Mock Summary Point 2"],
        actionItems: [{ who: "Test User", action: "Test Action", due: "Tomorrow" }],
        decisions: ["Decision 1"]
    }))
}));

describe('AI Meeting Summary API', () => {

    beforeAll(async () => {
        // Connect to a test database or use existing connection logic if feasible for this environment.
        // For unit testing the route logic (mocking the service/LLM), we might not need a real DB connection 
        // if we mock the DB calls too.
        // However, the controller calls the service which calls Mongoose models.
        // To make this a true "unit" test of the route/controller, we should mock the Service method.
        // But integration test was requested: "post sample chat data and checks JSON shape".

        // For simplicity in this environment without a dedicated test DB instance, 
        // we will mock the Service `generateMeetingSummary` entirely to test the Controller/Route layer.
        // Or we rely on the mocked LLM and let it try to hit DB? 
        // If we let it hit DB, it needs a connection. `app` imports `connectDB`. 
        // But we don't want to mess with prod DB.
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    it('POST /api/ai/meeting-summary should return formatted summary', async () => {
        // We mock the service in `modules/ai/ai.controller.js`? 
        // Jest module mocking is easier if we test the service or controller in isolation.
        // Testing the route via supertest requires the whole app setup.

        // Let's rely on the LLM mock and send "text" sourceType which skips DB calls in the service.

        const res = await request(app)
            .post('/api/ai/meeting-summary')
            .send({
                sourceType: 'text',
                content: 'This is a sample meeting text that is long enough to be summarized.',
                metadata: { timestampStart: new Date() }
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('summary');
        expect(res.body.data).toHaveProperty('actionItems');
        expect(res.body.data.summary).toBeInstanceOf(Array);
        expect(res.body.data.summary[0]).toBe("Mock Summary Point 1");
    });

    it('POST /api/ai/meeting-summary should fail with invalid input', async () => {
        const res = await request(app)
            .post('/api/ai/meeting-summary')
            .send({
                sourceType: 'invalid',
                content: 'content'
            });

        expect(res.statusCode).toEqual(400);
    });
});
