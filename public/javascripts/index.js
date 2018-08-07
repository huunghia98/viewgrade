const clickName = () => {
    document.getElementById("courseName").checked = true
    document.getElementById("courseId").checked = false;
}

const clickId = () => {
    document.getElementById("courseName").checked = false;
    document.getElementById("courseId").checked = true;
}


const addFollow = () => {
    window.location.href ='/follow/add'
}

const cancel = () => {
    window.location.href = '/follow'
}
