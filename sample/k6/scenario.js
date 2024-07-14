import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.0.0/index.js';

export let options = {
    vus: 10,
    duration: '1m',
};

const BASE_URL = 'http://YOUR_ALB_DNS_NAME';

export default function () {
    // Randomly choose to either view the page or submit a form
    let isFormSubmission = Math.random() < 0.5;

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