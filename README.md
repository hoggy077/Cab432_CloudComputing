# Cloud Computing
## Assignment 1 | Steamflow
Built for Docker, Steamflow was a conceptual stateless web service that filled a unique but familiar use case. Every gamer has at some point sought footage on an upcoming or wishlisted title & Steamflow was designed to solve this problem. 

Technologies
- DynamoDB (AWS) | _For persistent data_
- Redis | _For short-term in-memory caching_
- Docker | 
- Youtube API | 
- NodeJS | _JS Runtime_
- React | _For frontend UI_
- Express | _For backend API_

Features
- Wishlisted access | _Account must be public, & provides a list of wishlist games for selection_
- Featured Games | _Lists the games actively displayed on the Steam store page_
- App ID | _Direct access to the steam pages related data_

Each feature ultimately leads to the App ID associated page. On this page minimal relevant information is displayed, including total reviews, available platforms, if the game costs money to acquire & a selection of related youtube videos for quick viewing.

For images & other system information, refer to _report.docx_ located in the SteamFlow folder.

**All API keys utilized in the report are now invalid for security. Feel free to utilize your own.**


## Assignment 2 | Image Editor
Built for AWS, Image Editor was created as a high-load web service to demonstrate expandability of AWS services.

Technologies
- AWS | 
- S3 (AWS) | _Provides temporary image storage. Is cleared at midnight UTC each day_
- Redis/Elasticache | _For short-term in-memory caching of image checksums used to refer to S3_
- Docker | 
- NodeJS | _JS Runtime_
- React | _For frontend UI_
- Express | _For backend API_

Features
- Basic image modification & effects
- Image layering

Image Editor utilizes the Checksum package to prevent duplicate image uploads to S3. In essence, an uploaded image is loaded directly to S3, utilizing the checksum as the key. The checksum is then stored in Elasticache for the same duration as the S3 entry. This offloads additional pressure on each instance to a common large scale cache. The Elasticache follows the same expiration conditions as S3 entries.
When downloading the image, each server takes a arbitrary amount of time as the server must process & apply each image effect based on layer order, before serving the user via an S3 external link.