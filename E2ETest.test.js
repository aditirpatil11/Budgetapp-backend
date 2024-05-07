const supertest = require('supertest');
const app = require('./app');



describe("POST /signingup", () => {
    describe("given all the required details", () => {
        test("should respond with a 200 status code", async () => {
            const response = await supertest(app).post('/signingup').send({
                 username: 'test',
                email: 'test@example.com', 
                password: 'test'
            })
            expect(response.statusCode).toBe(200);
            expect(response.text).toBe('User inserted successfully');
        })
    })
})

