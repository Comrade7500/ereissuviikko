Tässä dokumentissa määritellään tietomalli (taulut, sarakkeet ja tietotyypit)

student
id: int (pk)
name: text
dob: date
address: text
phone: text
email: text
class: text (fk -> class)

class
id: text (pk)
teacher: int (fk -> teacher)

teacher
id: int (pk)
name: text
phone: text
email: text

lesson
id: int (pk)
date: date
start: char(5)
end: char(5)
subject: text
teacher: int (fk -> teacher)

parent
id: int (pk)
name: text
phone: text
email: text

student_parent_connection
student: int (fk -> student)
parent: int (fk -> parent)

absence
id: int (pk)
lesson: int (fk -> lesson)
student: int (fk -> student)
type: enum (unclear, with permission, with out permission)
reasen: text
seen_by_parent_at: datetime

user
email: text (pk)
student: int (fk -> student, nullable)
teacher: int (fk -> teacher, nullable)
parent: int (fk -> parent, nullable)

message
id: int (pk)
sender: int (fk -> user)
subject: text
body: text
sent_at: datetime

message_to
id: int (fk -> message)
recipient: int (fk -> user)
seen_at: datetime
