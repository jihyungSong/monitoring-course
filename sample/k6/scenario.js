import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.0.0/index.js';

export let options = {
    stages: [
        { duration: '30s', target: 10 }, // Ramp-up to 10 virtual users over 30 seconds
        { duration: '1m', target: 20 },  // Stay at 20 virtual users for 1 minute
        { duration: '30s', target: 30 }, // Ramp-up to 30 virtual users over 30 seconds
        { duration: '1m', target: 40 },  // Stay at 40 virtual users for 1 minute
        { duration: '30s', target: 50 }, // Ramp-up to 50 virtual users over 30 seconds
        { duration: '1m', target: 50 },  // Stay at 50 virtual users for 1 minute
        { duration: '30s', target: 10 },  // Ramp-down to 10 virtual users over 30 seconds
    ],
};

const BASE_URL = 'http://{YOUR_ALB_DNS}';

export default function () {
    // Randomly choose to either view the page or submit a form
    let isFormSubmission = Math.random() < 0.1;

    if (isFormSubmission) {
        // Perform form submission
        let payload = {
            description: randomString(10),
            value: (Math.random() * 100).toFixed(2),
        };

        let params = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        };

        let res = http.post(`${BASE_URL}transaction`, payload, params);

        check(res, {
            'is status 200': (r) => r.status === 200,
            'transaction added': (r) => r.body.includes('Transaction List'),
        });
    } else {
        // Perform page view
        let res = http.get(BASE_URL);

        check(res, {
            'is status 200': (r) => r.status === 200,
            'page contains table': (r) => r.body.includes('<table>'),
        });
    }

    sleep(1);
}