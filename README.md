# MoTask Frontend

Modern, responsive web interface for MoTask - a collaborative project management platform.

## 🚀 Live Demo

**[View Live App →](https://task-frontend-green-delta.vercel.app/)**

*Test Account*: 
- Username: `demo@taskflow.com`
- Password: `demo123`

## ✨ Features

- **Team Collaboration** - Create teams and invite members with role-based permissions
- **Project Management** - Organize work into projects with status tracking
- **Task System** - Create, assign, and track tasks with priorities and statuses
- **Real-time Updates** - See changes as they happen across your team
- **Comments** - Discuss tasks with threaded comments
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

## 🛠️ Tech Stack

- **Framework**: React 18
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **HTTP Client**: Fetch API
- **State Management**: React Hooks (useState, useEffect)
- **Deployment**: Vercel




### Prerequisites
- Node.js 16+
- npm or yarn

### Setup

1. Clone the repository
```bash
git clone 
cd task-frontend
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file
```bash
REACT_APP_API_URL=https://task-management-api-production-a18c.up.railway.app
```

4. Start development server
```bash
npm start
```

App will open at `http://localhost:3000`

## 📦 Project Structure

```
taskflow-frontend/
├── src/
│   ├── components/
│   │   ├── Dashboard.js      # Main dashboard
│   │   ├── Login.js          # Authentication
│   │   ├── Register.js       # User registration
│   │   ├── Teams.js          # Team management
│   │   ├── TeamMembers.js    # Member management
│   │   ├── Projects.js       # Project list/CRUD
│   │   └── Tasks.js          # Task management
│   ├── App.js                # Main app component
│   ├── index.js              # Entry point
│   └── index.css             # Global styles
├── public/
└── package.json
```

## 🎨 Key Components

### Dashboard
Central hub showing statistics, recent projects, and tasks with quick actions.

### Teams
Create and manage teams, invite members, and assign roles (Owner, Admin, Member).

### Projects
Organize work into projects with status tracking (Active, Completed, Archived).

### Tasks
Create tasks with:
- Priorities (Low, Medium, High, Urgent)
- Statuses (Todo, In Progress, Done, Blocked)
- Assignees
- Comments and discussions



## 🚀 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variable: `REACT_APP`
4. Deploy



## 📝 License

MIT License - feel free to use this project for learning and portfolio purposes.



## 🙏 Acknowledgments

Built with modern React best practices to demonstrate frontend development skills.

---

⭐ Star this repo if you found it helpful!