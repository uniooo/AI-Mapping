// Constraints
CREATE CONSTRAINT IF NOT EXISTS FOR (j:Job) REQUIRE j.job_id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (m:Major) REQUIRE m.major_id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (c:Company) REQUIRE c.company_id IS UNIQUE;
CREATE CONSTRAINT IF NOT EXISTS FOR (u:University) REQUIRE u.univ_id IS UNIQUE;
CREATE INDEX IF NOT EXISTS FOR ()-[r:MATCHES]-() ON (r.score);

// Load Jobs
LOAD CSV WITH HEADERS FROM 'file:///jobs.csv' AS row
MERGE (j:Job {job_id: row.job_id})
SET j.title=row.title, j.company=row.company, j.city=row.city,
    j.level=row.level, j.skills=split(row.skills,';'),
    j.salary=row.salary, j.desc=row.desc, j.url=row.url;

// Load Majors
LOAD CSV WITH HEADERS FROM 'file:///majors.csv' AS row
MERGE (m:Major {major_id: row.major_id})
SET m.name=row.name, m.university=row.university, m.discipline=row.discipline,
    m.degree_level=row.degree_level, m.skills=split(row.skills,';'),
    m.program_desc=row.program_desc, m.course_list=split(row.course_list,';'),
    m.url=row.url;

// Load Matches
LOAD CSV WITH HEADERS FROM 'file:///matches.csv' AS row
MATCH (j:Job {job_id: row.job_id})
MATCH (m:Major {major_id: row.major_id})
MERGE (j)-[r:MATCHES]->(m)
SET r.score=toFloat(row.score), r.method=row.method,
    r.run_id=row.run_id, r.timestamp=date(row.timestamp),
    r.feature_weights=row.feature_weights;
