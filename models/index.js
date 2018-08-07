var db = require('../db');
var fs = require('fs')
var path = require('path')
var crypto = require('crypto')

var index = {
    login(user, pass) {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM users WHERE (user = ? AND password = ?) limit 1', [user, pass], (err, ret) => {
                if (err) reject(err);
                else resolve(ret);
            });
        })
    },

    searchFilesByCourseNam(courseName, yearId, semesterId) {
        return new Promise((resolve, reject) => {
            var query = 'select `files`.`fileId`, `files`.`courseId`, `c`.`courseName`, `files`.`STT`, `files`.`yearId`, `y`.`name` as `yearName`, `files`.`semesterId`, `s`.`name` as `semesterName`' +
                'FROM `files`' +
                'INNER JOIN `courses` as `c` on `files`.`courseId` = `c`.`courseId`' +
                'INNER JOIN `years` as `y` on `files`.`yearId` = `y`.`id`' +
                'INNER JOIN `semester` `s` on `s`.`id` = `files`.`semesterId`' +
                'WHERE ( `courseName` like ? and `yearId` = ? and `semesterId` = ?)';
            db.query(query, ['%' + courseName + '%', yearId, semesterId], (err, ret) => {
                if (err) reject(err)
                else resolve(ret)
            })
        })
    },

    searchFilesByCourseId(courseId, yearId, semesterId) {
        return new Promise((resolve, reject) => {
            var query = 'select `files`.`fileId`, `files`.`courseId`, `c`.`courseName`, `files`.`STT`, `files`.`yearId`, `y`.`name` as `yearName`, `files`.`semesterId`, `s`.`name` as `semesterName`' +
                'FROM `files`' +
                'INNER JOIN `courses` as `c` on `files`.`courseId` = `c`.`courseId`' +
                'INNER JOIN `years` as `y` on `files`.`yearId` = `y`.`id`' +
                'INNER JOIN `semester` `s` on `s`.`id` = `files`.`semesterId`' +
                'WHERE (`files`.`courseId` like ? and `yearId` = ? and `semesterId` = ?)';
            db.query(query, ['%' + courseId + '%', yearId, semesterId], (err, ret) => {
                if (err) reject(err)
                else resolve(ret)
            })
        })
    },

    searchFiles(courseName, courseId, STT, yearId, semesterId) {
        return new Promise((resolve, reject) => {
            var query = 'select `files`.`fileId`, `files`.`courseId`, `c`.`courseName`, `files`.`STT`, `files`.`yearId`, `y`.`name` as `yearName`, `files`.`semesterId`, `s`.`name` as `semesterName`' +
                'FROM `files`' +
                'INNER JOIN `courses` as `c` on `files`.`courseId` = `c`.`courseId`' +
                'INNER JOIN `years` as `y` on `files`.`yearId` = `y`.`id`' +
                'INNER JOIN `semester` `s` on `s`.`id` = `files`.`semesterId`' +
                'WHERE (`files`.`courseId` like ? and `c`.`courseName` like ? and `files`.`STT` like ? and `yearId` like ? and `semesterId` like ?)';
            db.query(query, ['%' + courseId + '%', '%' + courseName + '%', '%'+STT+'%', '%'+yearId+'%', '%'+semesterId+'%'], (err, ret) => {
                if (err) reject(err)
                else resolve(ret)
            })
        })
    },

    getMaxYearId() {
        return new Promise((resolve, reject) => {
            db.query('select max(`yearId`) as maxYearId from `files`', (err, ret) => {
                if (err) reject(err)
                else resolve(ret)
            })
        })
    },

    getMaxSemesterId(yearId) {
        return new Promise((resolve, reject) => {
            db.query('select max(`semesterId`) as maxSemesterId from `files` where `yearId` = ?', [yearId], (err, ret) => {
                if (err) reject(err)
                else resolve(ret)
            })
        })
    },

    getCoursesList() {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM `courses`', (err, ret) => {
                if (err) reject(err)
                else resolve(ret)
            })
        })
    },

    getYearsList() {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM `years`', (err, ret) => {
                if (err) reject(err)
                else resolve(ret)
            })
        })
    },

    getFollowList(userId) {
        return new Promise((resolve, reject) => {
            var query = 'select `f`.`id`, `f`.`courseId`, `c`.`courseName`, `f`.`STT`, `f`.`semester`, `y`.`name`, `y`.`id` as `yearId`' +
                'FROM `follows` as `f`' +
                '    INNER JOIN `courses` as `c` on `f`.`courseId` = `c`.`courseId`' +
                '    INNER JOIN `years` as `y` on `f`.`yearId` = `y`.`id`' +
                'WHERE `f`.`userId` = ? ORDER BY `courseId`'
            db.query(query, [userId], (err, ret) => {
                if (err) reject(err)
                else resolve(ret)
            })
        })
    },

    getSemesterList() {
        return new Promise((resolve, reject) => {
            db.query('select * from `semester`', (err, ret) => {
                if (err) reject(err)
                else resolve(ret)
            })
        })
    },

    savePath(courseId, STT, semester, year, filePath) {
        return new Promise((resolve, reject) => {
            db.query('insert into `files` (`courseId`, `STT`, `semesterId`, `yearId`, `path`) values' +
                '(?, ?, ?, ?, ?)', [courseId, STT, semester, year, filePath], (err, ret) => {
                if (err) reject(err)
                else resolve(ret)
            })
        })
    },

    saveFile(reqBody, files) {
        var oldpath = files.path
        var parentPath = path.normalize(__dirname + '/../public/upload/' + reqBody.years + '/' + reqBody.semester + '/')
        console.log(parentPath)
        var newpath = parentPath + reqBody.courseId + '_' +  reqBody.STT + '.pdf'

        return new Promise((resolve, reject) => {
            fs.rename(oldpath, newpath, (err) => {
                if (err) reject(err)
                else resolve(newpath)
            })
        })
    },

    getFiles(courseId, STT, semester, yearId) {
        return new Promise((resolve, reject) => {
            db.query('select * from files where `courseId` = ? and `STT` = ? and `semesterId` = ? and yearId = ?',
                [courseId, STT, semester, yearId], (err, ret) => {
                if (err) reject(err)
                else resolve(ret)
            })
        })
    },

    checkFile(courseId, STT, semester, yearId) {
        return new Promise((resolve, reject) => {
            db.query('select * from `files` where `courseId`= ? and `STT` = ? and `semesterId` = ? and `yearId` = ?',
                [courseId, STT, semester, yearId], (err, ret) => {
                if (err) reject(err)
                else resolve(ret)
            })
        })
    },

    async getFollowFiles(followList) {
        try {
            var ret = []
            for (var i = 0; i < followList.length; i++) {
                let temp = await index.getFiles(followList[i].courseId, followList[i].STT, followList[i].semester, followList[i].yearId)
                if (temp.length) ret.push(temp[0])
                else ret.push(null)
            }
            return ret
        } catch (e) {
            throw e
        }
    },

    checkFollow(userId, courseId, STT, yearId, semester) {
        return new Promise((resolve, reject) => {
            db.query('select * from follows where userId = ? and courseId = ? and STT = ? and yearId = ? and semester = ?',
                [userId, courseId, STT, yearId, semester], (err, ret) => {
                if (err) reject(err)
                else resolve(ret)
            })
        })
    },

    unFollow(id) {
        return new Promise((resolve, reject) => {
            db.query('delete from `follows` where id = ?', [id], (err, ret) => {
                if (err) reject(err)
                else resolve(ret)
            })
        })
    },

    addFollow(userId, courseId, STT, yearId, semester) {
        return new Promise((resolve, reject) => {
            db.query('insert into `follows` (`userId`, `courseId`, `STT`, `yearId`, `semester`) values (?, ?, ?, ?, ?)',
                [userId, courseId, STT, yearId, semester], (err, ret) => {
                if (err) reject(err)
                else resolve(ret)
            })
        })
    },

    getPathFile(fileId) {
        return new Promise((resolve, reject) => {
            db.query('select `path` from `files` where `fileId` = ?', [fileId], (err, ret) => {
                if (err) reject(err)
                else resolve(ret)
            })
        })
    },

    removePath(fileId) {
        return new Promise((resolve, reject) => {
            db.query('delete from `files` where `fileId` = ?', [fileId], (err, ret) => {
                if (err) reject(err)
                else resolve(ret)
            })
        })
    },

    removeFile(filePath) {
        return new Promise((resolve, reject) => {
            fs.unlink(filePath, (err, ret) => {
                if (err) reject(err)
                resolve(ret)
            })
        })
    }
}

module.exports = index;