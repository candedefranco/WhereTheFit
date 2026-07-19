# WhereTheFit ✨
<p align="left">
  <a href="https://python.org">
    <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  </a>
  <a href="https://reactjs.org">
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  </a>
  <a href="https://www.postgresql.org/">
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  </a>
  <a href="https://aws.amazon.com/">
    <img src="https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white" alt="AWS" />
  </a>
</p>

### The fashion-focused social network for the Argentine market 🇦🇷

---

Saw an outfit you loved and don't know where to get it? **WhereTheFit is for you.**

Users post photos of pieces they're looking for and the community responds with store links, showroom addresses, Instagram profiles, and anything else that helps track down the item.

## How it works

1.  **Post a photo** of the piece you're looking for — a screenshot, a street photo, anything.
2.  **The community comments** with leads: store links, Instagram profiles, showroom addresses.
3.  **Mark your post as resolved** once you find what you were looking for, and share where you got it to help others.

## Features

- **Instagram-style carousel:** Upload up to 3 photos per post.
- **AI-powered tag suggestions (Google Gemini):** Automatic suggestions based on image analysis.
- **AI-powered similar clothing links:** Gemini suggests real stores where you can find similar items.
- **Model fallback:** If one Gemini model is down, automatically tries the next one.
- **Threaded comments:** Organized replies for better interaction.
- **Resolution system:** Mark your search as resolved and share where you found it.
- **Categories and tags:** Easily organize and find posts.
- **User profiles:** Track active and resolved search history.
- **Follow system:** Connect with other style seekers.
- **Real-time chat (WebSockets):** Message your mutuals instantly with edit/delete support.
- **Pinterest-style masonry feed:** A fully responsive and visual exploration experience.
- **For You feed:** Personalized post recommendations based on your liked posts.
- **Nearby filter:** Filter posts by distance using GPS location and a custom km range slider.
- **Distance display:** See how far each post is from your location.
- **Paginated feed:** Load more posts with a "see more" button.
- **Google OAuth:** Sign in with your Google account.
- **Email verification:** Verify your account via email before logging in.
- **Password recovery:** Reset your password via email link.
- **Daily email digest:** Get notified about likes, comments, new followers, and resolved posts.
- **Email notifications toggle:** Enable/disable daily email summaries.

## Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Backend** | Python + Flask | Robust and lightweight web framework. |
| **Database** | PostgreSQL (AWS RDS) | Cloud-hosted relational database. |
| **ORM** | SQLAlchemy | SQL toolkit and Object-Relational Mapper. |
| **Auth** | JWT + Google OAuth | Secure authentication via tokens and Google sign-in. |
| **Storage** | AWS S3 | Scalable cloud object storage for user photos. |
| **AI** | Google Gemini | Visual analysis, tag suggestions, and similar clothing links. |
| **Real-time** | WebSockets | Instant messaging between mutual followers. |
| **Email** | Flask-Mail + Gmail SMTP | Verification, password recovery, and daily digests. |
| **Frontend** | React + TypeScript + Vite | Modern, typed, and ultra-fast development. |
| **Layout** | `react-masonry-css` | Responsive masonry layout for the feed. |
| **Infra** | AWS EC2 + Nginx + Gunicorn | Production deployment with reverse proxy. |
| **IaC** | AWS CloudFormation | Infrastructure as Code for reproducible deployments. |

## Deployment

The project includes a full EC2 deployment setup:

```bash
# Deploy infrastructure with CloudFormation
aws cloudformation create-stack --stack-name wherethefit \
  --template-body file://deploy/cloudformation.yaml \
  --region us-east-2 \
  --parameters ParameterKey=KeyName,ParameterValue=your-key \
               ParameterKey=RDSSecurityGroupId,ParameterValue=sg-xxx

# Setup the EC2 instance
ssh ubuntu@EC2_IP
./deploy/setup-ec2.sh

# Redeploy after changes
./deploy/redeploy.sh
```

See `deploy/` folder for Nginx config, systemd services, and setup scripts.
