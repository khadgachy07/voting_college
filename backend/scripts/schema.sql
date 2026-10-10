-- Voting College Election System — Database Schema
-- Run via: mysql -u root -ppassword voting_college < scripts/schema.sql
-- Assumes the voting_college database exists (created by docker-compose).

USE voting_college;

-- ---------------------------------------------------------------------------
-- Users (admins, students, candidates share one table via role)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin', 'student', 'candidate') NOT NULL DEFAULT 'student',
  status        ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Students (voters)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL UNIQUE,
  student_id      VARCHAR(50) UNIQUE,
  faculty         VARCHAR(100),
  department      VARCHAR(100),
  semester        VARCHAR(50),
  batch           VARCHAR(50),
  eligibility_status ENUM('eligible', 'ineligible', 'pending') NOT NULL DEFAULT 'pending',
  password_reset_code VARCHAR(255) NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Elections
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS elections (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(200) NOT NULL,
  description   TEXT,
  academic_year VARCHAR(20),
  start_datetime DATETIME NOT NULL,
  end_datetime   DATETIME NOT NULL,
  status        ENUM('draft', 'upcoming', 'active', 'closed', 'results_published') NOT NULL DEFAULT 'draft',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Positions within an election
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS positions (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  election_id   INT NOT NULL,
  name          VARCHAR(100) NOT NULL,
  description   TEXT,
  max_candidates INT DEFAULT 1,
  voting_rule   ENUM('one_candidate', 'multiple_candidates') NOT NULL DEFAULT 'one_candidate',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Candidates
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS candidates (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  student_id      INT NOT NULL,
  election_id     INT NOT NULL,
  position_id     INT NOT NULL,
  symbol          VARCHAR(50),
  photo           VARCHAR(255),
  biography       TEXT,
  manifesto       TEXT,
  campaign_message TEXT,
  approval_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
  FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Votes (one row per voter per position)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS votes (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  election_id    INT NOT NULL,
  position_id    INT NOT NULL,
  candidate_id   INT NOT NULL,
  voter_reference VARCHAR(100) UNIQUE NOT NULL,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
  FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Audit log
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NULL,
  action      VARCHAR(100) NOT NULL,
  details     TEXT,
  ip_address  VARCHAR(45),
  user_agent  VARCHAR(255),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NULL,
  title       VARCHAR(200) NOT NULL,
  message     TEXT,
  type        ENUM('info', 'warning', 'success') NOT NULL DEFAULT 'info',
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
