var express = require('express');
var router = express.Router();
var index = require('../models/index');
var multer = require('multer')
var upload = multer({dest: 'upload/'})
var fs = require('fs')

/* GET home page. */
router.get('/', (req, res) => {
    if (req.session.user)
        res.redirect('/home')
    else
        res.render('index', {success: 'true'})
});

router.get('/home', (req, res) => {
    if (req.session.user) {
        if (req.session.admin) {
            res.render('home', {admin: true})
        } else {
            res.render('home', {admin: false})
        }
    } else {
        res.redirect('/')
    }
})

router.post('/', async (req, res) =>{
    try {
        var userId = req.body.userId
        var pass = req.body.pass
        var ret = await index.login(userId, pass)
        if (ret[0].user == userId && ret[0].password == pass) {
            req.session.userId = req.body.userId
            req.session.user = true
            if (ret[0].user == 'admin') {
                req.session.admin = true
            } else {
                req.session.admin = false
            }
            res.redirect('/home')
        } else {
            req.session.user = false
            req.session.userId = 0
            req.session.admin = false
            res.render('index', {success: 'false'})
        }
    } catch (e) {
        res.render('index', {success: 'false'})
    }
})

router.get('/logout', (req, res) => {
    if (!req.session.user) {
        res.redirect('/')
    } else {
        req.session.user = false
        req.session.userId = 0
        req.session.admin = false
        res.render('logout')
    }
})

router.get('/search', (req, res) => {
    if (req.session.user) {
        if (req.session.admin) {
            res.render('search', {input: true, admin: true})
        } else {
            res.render('search', {input: true, admin: false})
        }
    } else {
        res.redirect('/')
    }
})

router.post('/search', async (req, res) => {
    try {
        if (req.body.inputCourse == "") {
            res.render('search', {input: false})
        } else if (req.body.courseName) {
            let yearId = await index.getMaxYearId()
            console.log(yearId)
            let semesterId = await index.getMaxSemesterId(yearId[0].maxYearId)
            let files = await index.searchFilesByCourseNam(req.body.inputCourse, yearId[0].maxYearId, semesterId[0].maxSemesterId)
            if (req.session.admin) {
                res.render('searchList', {reqBody: req.body, data: files, admin: true})
            } else {
                res.render('searchList', {reqBody: req.body, data: files, admin: false})
            }
        } else {
            let yearId = await index.getMaxYearId()
            let semesterId = await index.getMaxSemesterId(yearId[0].maxYearId)
            let files = await index.searchFilesByCourseId(req.body.inputCourse, yearId[0].maxYearId, semesterId[0].maxSemesterId)
            if (req.session.admin)
                res.render('searchList', {reqBody: req.body, data: files, admin: true})
            else
                res.render('searchList', {reqBody: req.body, data: files, admin: false})
        }
    } catch (e) {
        if (req.session.admin)
            res.render('search', {input: false, admin: true})
        else
            res.render('search', {input: false, admin: false})
    }
})

router.get('/upload', async (req, res) => {
    if (!req.session.user || !req.session.admin) {
        res.redirect('/home')
    } else {
        try {
            var ret = await Promise.all([index.getYearsList(), index.getSemesterList(), index.getCoursesList()])
            res.render('upload', {success: false, years: ret[0], semester: ret[1], courses: ret[2]})
        } catch (e) {
            res.json({message: e.message})
        }
    }
})

router.post('/upload', upload.single('fileUpload'), async (req, res) => {
    try {
        var ret = await index.checkFile(req.body.courseId, req.body.STT, req.body.semester, req.body.years)
        if (!ret.length) {
            var ret1 = await index.saveFile(req.body, req.file)
            var ret2 = await index.savePath(req.body.courseId, req.body.STT, req.body.semester, req.body.years, ret1)
            res.render('upload', {success: true})
        } else {
            res.render('upload_error')
        }
    } catch (e) {
        res.render('upload_error')
    }
})

router.get('/follow', async (req, res) => {
    if (!req.session.user) {
        res.redirect('/')
    } else {
        try {
            var ret = await Promise.all([index.getCoursesList(), index.getFollowList(req.session.userId)])
            var ret2 = await index.getFollowFiles(ret[1])
            if (req.session.admin) {
                res.render('follow', {admin: true, success: false, courses: ret[0], followList: ret[1], followFiles: ret2})
            } else {
                res.render('follow', {admin: false, success: false, courses: ret[0], followList: ret[1], followFiles: ret2})
            }
        } catch (e) {
            res.json({message: e.message})
        }
    }
})

router.get('/follow/delete/:id', async (req, res) => {
    if (req.session.user) {
        try {
            var id = req.params.id;
            var ret = await index.unFollow(id)
            res.redirect('/follow')
        } catch (e) {
            res.json({message: e.message})
        }
    } else {
        res.redirect('/')
    }
})

router.get('/follow/add', async (req, res) => {
    if (req.session.user) {
        try {
            var ret = await Promise.all([index.getCoursesList(), index.getYearsList(), index.getSemesterList()])
            if (req.session.admin) {
                res.render('add_follow', {admin: true, courses: ret[0], years: ret[1], semester: ret[2]})
            } else {
                res.render('add_follow', {admin: false, courses: ret[0], years: ret[1], semester: ret[2]})
            }
        } catch (e) {
            res.json({message: e.message})
        }
    } else {
        res.redirect('/')
    }
})

router.post('/follow/add', async (req, res) => {
    try {
        var ret1 = await index.checkFollow(req.session.userId, req.body.courseId, req.body.STT, req.body.yearId, req.body.semester)
        if (!ret1.length)
            var ret2 = await index.addFollow(req.session.userId, req.body.courseId, req.body.STT, req.body.yearId, req.body.semester)
        res.redirect('/follow')
    } catch (e) {
        res.json({message: e.message})
    }
})

router.get('/follow/view/:fileId', async (req, res) => {
    if (req.session.user) {
        try {
            var fileId = req.params.fileId
            var ret = await index.getPathFile(fileId)
            var file = fs.createReadStream(ret[0].path)
            var stat = fs.statSync(ret[0].path)
            file.pipe(res)
        } catch (e) {
            res.json({message: e.message})
        }
    } else {
        res.redirect('/')
    }
})

router.get('/advance', async (req, res) => {
    if (req.session.user) {
        try {
            var ret = await Promise.all([index.getCoursesList(), index.getSemesterList(), index.getYearsList()])
            if (req.session.admin) {
                res.render('advance', {admin: true, courses: ret[0], semester: ret[1], years: ret[2]})
            } else {
                res.render('advance', {admin: false, courses: ret[0], semester: ret[1], years: ret[2]})
            }
        } catch (e) {
            res.json({message: e.message})
        }
    } else {
        res.redirect('/')
    }
})

router.post('/advance', async (req, res) => {
    try {
        var ret = await Promise.all([index.getCoursesList(), index.getSemesterList(), index.getYearsList(),
            index.searchFiles(req.body.courseName, req.body.courseId, req.body.STT, req.body.yearId, req.body.semesterId)])
        if (req.session.admin) {
            res.render('advanceList', {admin: true, courses: ret[0], semester: ret[1], years: ret[2], data: ret[3]})
        } else {
            res.render('advanceList', {admin: false, courses: ret[0], semester: ret[1], years: ret[2], data: ret[3]})
        }
    } catch (e) {
        res.json({message: e.message})
    }
})

router.get('/delete', async (req, res) => {
    if (req.session.admin) {
        try {
            var ret = await Promise.all([index.getCoursesList(), index.getSemesterList(), index.getYearsList()])
            res.render('delete', {courses: ret[0], semester: ret[1], years: ret[2]})
        } catch (e) {
            res.json({message: e.message})
        }
    } else {
        res.redirect('/')
    }
})

router.post('/delete', async (req, res) => {
    try {
        var ret = await Promise.all([index.getCoursesList(), index.getSemesterList(), index.getYearsList(),
            index.searchFiles(req.body.courseName, req.body.courseId, req.body.STT, req.body.yearId, req.body.semesterId)])
        res.render('deleteList', {courses: ret[0], semester: ret[1], years: ret[2], data: ret[3]})
    } catch (e) {
        res.json({message: e.message})
    }
})

router.get('/delete/:id', async (req, res) => {
    if (req.session.admin) {
        try {
            var id = req.params.id
            var ret1 = await index.getPathFile(id)
            var ret2 = await Promise.all([index.removePath(id), index.removeFile(ret1[0].path)])
            res.redirect('/delete')
        } catch (e) {
            res.json({message: e.message})
        }
    } else {
        res.redirect('/')
    }
})

module.exports = router