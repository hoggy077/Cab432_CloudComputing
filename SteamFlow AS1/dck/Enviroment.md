# Environmental Variables
| Service | Variable Name | Value | Required | Notes |
|---|---|---|---|---|
|AWS|AWS_ACCESS_KEY_ID|*Any AWS Access key*|✓ (For DynamoDB)|
|AWS|AWS_SECRET_ACCESS_KEY|*Any AWS Secret key*|✓ (For DynamoDB)|
|AWS|AWS_SESSION_TOKEN|*Any AWS Session token*|✓ (For DynamoDB)|
|Server|PORT|*Any externally available port to serve http via*||This only changes the express port.
|Server|DEV_Key|*Any value that is safe as an auth token*||This is used to authorize access to the individual API endpoints, which do not include caching and should be used sparingly
|Server|redisConfig|*Redis Client compatible Json config*||[Configuration guide](https://github.com/redis/node-redis/blob/master/docs/client-configuration.md)
|Server|YOUTUBE_Key|*Youtube enabled Google service provided API Key*|✓|The key is used solely for searching and should reflect as such. Additionally, it will automatically be attached to the endpoint for searching, and thus is not needed when calling it