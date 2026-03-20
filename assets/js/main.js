// Global variables
var calendarEl = document.getElementById('calendar');
let events = []
let calendar;
let isFirstLoad = true;
let typingTimer;
let doneTypingInterval = 500;

// Document Ready function
$(document).ready(function(){
    // Initilizing Tooltips
    const skillDropdown = document.getElementById('id_skills')
    const skillDdTooltip = new bootstrap.Tooltip(skillDropdown, {})

    // initilize tooltip for dynamically generated attendance marking buttons
    $(document).on('mouseenter', '.mark-attendance', function(){
        let tooltip = bootstrap.Tooltip.getInstance(this);
        if (!tooltip) {
            tooltip = new bootstrap.Tooltip(this, {});
        }
        tooltip.show();
    });
    

    // Add Employee Modal Calling
    $("#add-employee").click(function(){
        $("#add-employee-modal-form")[0].reset();
        $("#addEmployeeModalLabel").html('Add Employee');
        $("#password-container").show();
        $("#id_email").removeAttr("readonly");
        $("#add-employee-button").attr('onclick', 'submitAddEmoloyeeForm()').html('Submit');

        const addEmplpoyeeModalElement = document.getElementById('addEmployeeModal');
        const addEmplpoyeeModal = new bootstrap.Modal(addEmplpoyeeModalElement);
        addEmplpoyeeModal.show();
    })

    // Load default data (Employees and related data)
    loadEmployees()
})

// =========================================== Functions ===========================================
// Mobile device check function
function mobilecheck() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
}

// Load Employees and related data (departments, designations) from the server
function loadEmployees(employee_name=null, use_loader=true){
    if (use_loader)
        startLoader()

    $.ajax({
        url: 'https://myhrms.zapto.org/api/employees/get_employees/',
        method: 'GET',
        data: {
            employee_name: employee_name
        },
        dataType: 'json',
        success: function(response) {
            if (response.success){
                // Update total employees count
                $("#total-employees-counter").html(response.total_count)
                $("#tab-all-emp-count").html(`(${response.tab_total_count})`)

                // Update resigned employees count
                $("#resigned-employees-counter").html(response.resigned_count)
                $("#tab-resigned-emp-count").html(`(${response.tab_resigned_count})`)

                // Updating new employees count
                if (response.new_count > 0)
                    $("#new-employees-counter").html(String(response.new_count) + " New Employees").show()
                else
                    $("#new-employees-counter").hide()
                
                // Fetch all Employee Data
                $("#detailed-view-body").empty()
                if (response.all_employees.length > 0){
                    response.all_employees.forEach(employee => {
                        $("#detailed-view-body").append(`
                            <tr>
                                <td><span class="text-uppercase">#${employee.employee_id}</span></td>
                                <td>
                                    <div class="d-flex gap-2 align-items-end user-profile-display">
                                        <div class="user-profile">
                                            <img src="assets/images/dummy_profile.png" class="w-100 rounded-circle" alt="${employee.full_name} profile image not found">
                                        </div>
                                        <div class="user-info">
                                            <h6 class="mb-0 user-full-name">${employee.full_name}</h6>
                                            <p class="mb-0 designation">${employee.designation_details ? employee.designation_details.name : 'Not specified'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td>${employee.department_details ? employee.department_details.name : 'Not specified'}</td>
                                <td>${employee.skills ? employee.skills.split(",").map(s => `<span class="custom-label blue-color-label small">${s.trim()}</span>`).join(" ") : '-'}</td>
                                <td>${calculateExperience(employee.date_of_joining, employee.experience)}</td>
                                <td>${employee.date_of_joining}</td>
                                <td>
                                    <a class="nav-link d-inline-block primary-bg-color edit-employee" href="javascript:void(0)" data-id="${employee.id}"><i class="fa-solid fa-pencil"></i></a>
                                    <a class="nav-link d-inline-block danger-bg-color archive-employee" href="javascript:void(0)" onclick="archiveEmployee(${employee.id})" data-id="${employee.id}"><i class="fa-solid fa-trash-can"></i></a>
                                </td>
                            </tr>
                        `)
                    })

                    $("#detailed-view-content-placeholder").hide()
                    $("#all-employees-table").show()
                } else {
                    $("#detailed-view-content-placeholder").show()
                    $("#all-employees-table").hide()
                }

                // Fetch resgined emplpoyees data
                // Updating Employee Data
                $("#resigned-detailed-view-body").empty()
                if (response.resigned_employees.length > 0){
                    response.resigned_employees.forEach(employee => {
                        $("#resigned-detailed-view-body").append(`
                            <tr>
                                <td><span class="text-uppercase">#${employee.employee_id}</span></td>
                                <td>
                                    <div class="d-flex gap-2 align-items-end user-profile-display">
                                        <div class="user-profile">
                                            <img src="assets/images/dummy_profile.png" class="w-100 rounded-circle" alt="${employee.full_name} profile image not found">
                                        </div>
                                        <div class="user-info">
                                            <h6 class="mb-0 user-full-name">${employee.full_name}</h6>
                                            <p class="mb-0 designation">${employee.designation_details ? employee.designation_details.name : 'Not specified'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td>${employee.department_details ? employee.department_details.name : 'Not specified'}</td>
                                <td>${employee.skills ? employee.skills.split(",").map(s => `<span class="custom-label blue-color-label small">${s.trim()}</span>`).join(" ") : '-'}</td>
                                <td>${calculateExperience(employee.date_of_joining, employee.experience)}</td>
                                <td>${employee.date_of_joining}</td>
                                <td>
                                    <a class="nav-link d-inline-block primary-bg-color archive-employee" href="javascript:void(0)" onclick="restoreEmployee(${employee.id})" data-id="${employee.id}"><i class="fa-solid fa-rotate-left"></i></a>
                                </td>
                            </tr>
                        `)
                    })

                    $("#resigned-view-content-placeholder").hide()
                    $("#resigned-employees-table").show()
                } else {
                    $("#resigned-view-content-placeholder").show()
                    $("#resigned-employees-table").hide()
                }

                // Updating Departments 
                $("#id_department").empty()
                $("#id_department").append('<option value="" selected>-- Select Department --</option>')
                response.departments.forEach(department => {
                    $("#id_department").append(`<option value="${department.id}">${department.name}</option>`)
                })

                // Updating Designation
                $("#id_designation").empty()
                $("#id_designation").append('<option value="" selected>-- Select Designation --</option>')
                response.designations.forEach(designation => {
                    $("#id_designation").append(`<option value="${designation.id}">${designation.name}</option>`)
                })

                if (use_loader)
                    stopLoader("dashboard")
            }
        },
        error: function(xhr, status, error) {
            console.log("Error:", error);
            if (use_loader)
                stopLoader("dashboard")
        }
    });
}


// Get Employee Details
function getEmployeeDetails(employee_id){
    // Rest form data
    $("#add-employee-modal-form")[0].reset()
    $("#password-container").hide()
    $("#id_email").attr("readonly", true)
    $.ajax({
        url: 'https://myhrms.zapto.org/api/employees/' + employee_id + '/get_employee/',
        type: 'get',
        dataType: "json",
        success: function(response) {
            if (response.success){
                // Split name into first and last name
                let name_parts = response.data.full_name.split(" ")
                let first_name = name_parts[0]
                let last_name = name_parts.length > 1 ? name_parts.slice(1).join(" ") : ""

                $("#id_employee_id").val(response.data.id)
                $("#id_first_name").val(first_name)
                $("#id_last_name").val(last_name)
                $("#id_email").val(response.data.email)
                $("#id_experience").val(response.data.experience)
                if (response.data.department)
                    $("#id_department").val(response.data.department).trigger("change");
                if (response.data.designation)
                    $("#id_designation").val(response.data.designation).trigger("change");

                if (response.data.skills && response.data.skills.length > 0){
                    $("#id_skills").val(response.data.skills.split(",").map(s => s.trim())).trigger("change");
                }

                $("#addEmployeeModal #addEmployeeModalLabel").html('Edit Employee')
                $("#add-employee-button").attr('onclick', 'submitAddEmoloyeeForm(true)').html('Update Employee')
                $("#addEmployeeModal").modal('show')
            } else if (response.error)
                Notiflix.Notify.failure(response.error); 
            else
                Notiflix.Notify.failure("Something went wrong. Please try again later!");

            if (!response.success){
                // it contains the stopLoader function
                loadEmployees()
                // If form submission failed, reopen the modal with previously filled data
                $("#addEmployeeModal").modal('hide')
            }
        },
        error: function(xhr, status, error) {
            console.log("Error:", error);
            // it contains the stopLoader function
            loadEmployees()
            // If form submission failed, reopen the modal with previously filled data
            $("#addEmployeeModal").modal('hide')
        }
    });
}


// Submit Add/Edit Employee Form
function submitAddEmoloyeeForm(edit=false){
    if (employeeFormValid()){
        startLoader()
        $("#addEmployeeModal").modal('hide')
        let form = document.querySelector("#add-employee-modal-form");
        let data = new FormData(form);

        // Update url and method type
        let url = 'https://myhrms.zapto.org/api/employees/add_employee/'
        let type = 'post'
        if (edit){
            let employee_id = $("#id_employee_id").val()
            url = 'https://myhrms.zapto.org/api/employees/' + employee_id + '/update_employee/'
            type = 'put'
        }
        
        submitAddEmoloyeeFormComponent(url, data, type)
    } else 
        Notiflix.Notify.failure("Please fill all the required fields!")
}

function submitAddEmoloyeeFormComponent(url, data, type, resubmit=false){
    if (resubmit)
        data.append('restore_archived_employee', true)
        
    $.ajax({
        url: url,
        data: data,
        type: type,
        processData: false,
        contentType: false,
        dataType: "json",
        success: function(response) {
            if (response.success){
                Notiflix.Notify.success("Employee added successfully!");
                loadEmployees()
                return
            } else if (response.need_activation_confirmation){ // If employee exist
                    Notiflix.Confirm.show(
                    'Restore Employee?',
                    `Employee already exist in system with ${$("#id_gmail").val()} email, Do you want to restore the archived user?`,
                    'Yes',
                    'Cancel',
                    function(){ 
                        submitAddEmoloyeeFormComponent(url, data, type, true)
                    },
                    function(){
                        $("#addEmployeeModal").modal('show');
                    }
                );
            } else if (response.user_exist){
                // If form submission failed, reopen the modal with previously filled data
                Notiflix.Notify.warning(`Employee already exist in system with ${$("#id_gmail").val()} email, please user different email!`)
                setTimeout(function(){
                    $("#addEmployeeModal").modal('show');
                }, 500)
            } else if (response.error)
                Notiflix.Notify.failure(response.error); 
            else
                Notiflix.Notify.failure("Something went wrong. Please try again later!");
            
            stopLoader("dashboard")
        },
        error: function(xhr, status, error) {
            console.log("Error:", error);
            // it contains the stopLoader function
            loadEmployees()
            // If form submission failed, reopen the modal with previously filled data
            $("#addEmployeeModal").modal('show')
        }
    });
}


// Archive Employee
function archiveEmployee(employee_id){
    Notiflix.Confirm.show(
        'Archive Employee',
        'Are you sure you want to archive this employee? This action can only be reversed from super admin portal.',
        'Yes',
        'Cancel',
        function(){ 
            startLoader()
            $.ajax({
                url: 'https://myhrms.zapto.org/api/employees/' + employee_id + '/archive_employee/',
                type: 'delete',
                dataType: "json",
                success: function(response) {
                    if (response.success){
                        Notiflix.Notify.success("Employee archived successfully!");
                        loadEmployees()
                        return
                    } else if (response.error)
                        Notiflix.Notify.failure(response.error); 
                    else
                        Notiflix.Notify.failure("Something went wrong. Please try again later!");

                    // it contains the stopLoader function
                    loadEmployees()
                },
                error: function(xhr, status, error) {
                    console.log("Error:", error);
                    // it contains the stopLoader function
                    loadEmployees()
                }
            });
        },
        function(){ 
            Notiflix.Notify.info('Employee archiving cancelled')
        }
    );
}


function restoreEmployee(employee_id){
    startLoader()
    $.ajax({
        url: 'https://myhrms.zapto.org/api/employees/' + employee_id + '/restore_employee/',
        type: 'patch',
        dataType: "json",
        success: function(response) {
            if (response.success){
                Notiflix.Notify.success("Employee restored successfully!");
                loadEmployees()
                return
            } else if (response.error)
                Notiflix.Notify.failure(response.error); 
            else
                Notiflix.Notify.failure("Something went wrong. Please try again later!");

            // it contains the stopLoader function
            loadEmployees()
        },
        error: function(xhr, status, error) {
            console.log("Error:", error);
            // it contains the stopLoader function
            loadEmployees()
        }
    }); 
}


// Calculate Experience using date of joining
function calculateExperience(doj, existing_experience=0){
    if (existing_experience == undefined || existing_experience == null || existing_experience == "0 Years")
        existing_experience = 0

    let totalMonths = 0;
    let currentDate = new Date();
    let joiningDate;
    if (doj){
        joiningDate = new Date(doj);
        totalMonths = (currentDate.getFullYear() - joiningDate.getFullYear()) * 12 + (currentDate.getMonth() - joiningDate.getMonth());
    }

    if (existing_experience)
        totalMonths += existing_experience * 12           
        
    let years = Math.floor(totalMonths / 12);
    let months = totalMonths % 12;

    let experience_str = ""
    if (years && months)
        experience_str = `${years} Year(s) ${months} Month(s)`
    else if (years && !months)
        experience_str = `${years} Year(s)`
    else if (!years && months)
        experience_str = `${months} Month(s)`

    // If experience is not provided and doj is there, calculate experience in days
    if (experience_str == "" && doj){
        let totalDays = Math.floor((currentDate - joiningDate) / (1000 * 60 * 60 * 24));
        experience_str = `${totalDays} Day(s)`
    }

    return experience_str ? experience_str : "";
}

// Load Calendar
function loadAttendanceCalendar() {
    startLoader();
    $(".date-filter").addClass("force-hide")

    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: mobilecheck() ? "listWeek" : "dayGridMonth",
        timeZone: 'IST',

        // Triggered when calendar view changes
        datesSet: function (info) {

            let startDate = info.start;
            let endDate = info.end;

            let month = endDate.getMonth() === 0 ? 12 : endDate.getMonth();
            let year = endDate.getMonth() === 0 ? endDate.getFullYear() - 1 : endDate.getFullYear();

            let monthKey = month + "" + year;

            let yearStart = startDate.getFullYear();
            let monthStart = startDate.getMonth() + 1;
            let dayStart = startDate.getDate();

            const endYear = endDate.getFullYear();
            const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
            const endDay = String(endDate.getDate()).padStart(2, '0');

            let weekKey = `${yearStart}-${monthStart}-${dayStart}`;
            let weekEnd = `${endYear}-${endMonth}-${endDay}`;

            fetchAttendance(startDate, endDate);

            isFirstLoad = false;
        },

        eventClick: function (info) {
            console.log('Event:', info.event.title);
        }
    });

    calendar.render();

    // Fix hidden container issue
    setTimeout(() => {
        calendar.updateSize();
    }, 200);
}

// Fethc Attendance data
function fetchAttendance(startDate, endDate) {
    $.ajax({
        url: 'https://myhrms.zapto.org/api/attendances/get_calendar_attendance/',
        method: 'GET',
        dataType: 'json',
        data: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            isMobile: mobilecheck()
        },

        success: function (response) {
            if (response.success) {

                let events = [];
                response.data.forEach(day => {
                    if (day.attendance_data.Present)
                        events.push({
                            title: `Present (${day.attendance_data.Present})`,
                            start: day.date,
                            classNames: ['event-style', 'present']
                        });

                    if (day.attendance_data.Absent)
                        events.push({
                            title: `Absent (${day.attendance_data.Absent})`,
                            start: day.date,
                            classNames: ['event-style', 'absent']
                        });

                    if (day.attendance_data.On_Leave)
                        events.push({
                            title: `On Leave (${day.attendance_data.On_Leave})`,
                            start: day.date,
                            classNames: ['event-style']
                        });
                });

                // Lazy update for calendar events to prevent re-rendering issues
                calendar.removeAllEvents();
                calendar.addEventSource(events);

                // Fix for layout after data load
                setTimeout(() => {
                    calendar.updateSize();
                }, 200);

                stopLoader("attendance-calendar");
            }
        },

        error: function (xhr, status, error) {
            console.log("Error:", error);
            stopLoader("attendance-calendar");
        }
    });
}


// Load list view attendance datta
function loadListViewAttendance(date=null){
    $(".date-filter").removeClass("force-hide")
    startLoader()
    // current date
    if (!date)
        date = $(".date-filter").val();
    
    $.ajax({
        url: 'https://myhrms.zapto.org/api/attendances/get_listview_attendance/',
        data: {
            attendance_date: date
        },
        method: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.success){
                // Updating Employee Data
                $("#employee-list-body").empty()
                if (response.data.length > 0){
                    $("#listview-content-placeholder").hide()
                    $("#list-view-container").show()
                    response.data.forEach(attendance => {
                        $("#employee-list-body").append(`
                            <tr>
                                <td>#${attendance.employee_details.employee_id}</td>
                                <td>
                                    <div class="d-flex gap-2 align-items-end user-profile-display">
                                        <div class="user-profile">
                                            <img src="assets/images/dummy_profile.png" class="w-100 rounded-circle" alt="">
                                        </div>
                                        <div class="user-info">
                                            <h6 class="mb-0 user-full-name">${attendance.employee_details.full_name}</h6>
                                            <p class="mb-0 designation">${attendance.employee_details.designation_details.name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td><span class="custom-label ${attendance.status == "Present" ? 'green' : attendance.status == "Absent" ? 'red' : 'blue'}-color-label">${attendance.status}</span></td>
                                <td>${attendance.employee_details.department_details.name}</td>
                                <td>
                                    <a class="nav-link mark-attendance d-inline-block primary-bg-color ${attendance.status == "Present" ? 'disabled' : attendance.status == "Absent" ? '' : ''}" href="javascript:void(0)" onclick="markAttendance('Present', ${attendance.employee}, ${response.is_current_day})" data-id="${attendance.employee}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-custom-class="custom-tooltip" data-bs-title="Mark ${attendance.employee_details.full_name} as present"><i class="fa-regular fa-calendar-check"></i></a>
                                    <a class="nav-link mark-attendance d-inline-block danger-bg-color ${attendance.status == "Present" ? '' : attendance.status == "Absent" ? 'disabled' : ''}"  href="javascript:void(0)" onclick="markAttendance('Absent', ${attendance.employee}, ${response.is_current_day})" data-id="${attendance.employee}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-custom-class="custom-tooltip" data-bs-title="Mark ${attendance.employee_details.full_name} as absent"><i class="fa-regular fa-calendar-xmark"></i></a>
                                </td>
                            </tr>
                        `)
                    })
                } else {
                    $("#listview-content-placeholder").show()
                    $("#list-view-container").hide()
                }
                // Update datepicker 
                let date = new Date(response.current_date);
                let formattedDate = date.toISOString().split('T')[0];

                $(".date-filter").val(formattedDate);

                stopLoader("attendance-calendar")
            }
        },
        error: function(xhr, status, error) {
            console.log("Error:", error);
            stopLoader("attendance-calendar")
        }
    });
}


// toggle Attedance 
function markAttendance(status, emp_id, is_current_day){
    if (!is_current_day){
        Notiflix.Notify.warning("You can only mark/update attendance for current day.")
        return
    }

    $.ajax({
        url: 'https://myhrms.zapto.org/api/attendances/'+ emp_id +'/mark_attendance/',
        method: 'patch',
        dataType: 'json',
        data: {
            status: status
        },
        success: function(response) {
            if (response.success){
                Notiflix.Notify.success("Attendance marked as present!")
                loadListViewAttendance($(".date-filter").val())
            }
        },
        error: function(xhr, status, error) {
            console.log("Error:", error);
        }
    });

}
// ------------------------------------- Helper Functions -------------------------------------
// EmployeeForm Validation
function employeeFormValid(skip_password=false){
    // Full form validation can be added here. For now, just checking if required fields are filled
    let valid = true;
    $("#add-employee-modal-form [required]").each(function(){
        if (!$(this).val() && $(this).parent("#password-container").length == 0){
            valid = false;
            $(this).addClass('is-invalid')
        } else {
            if ($(this).attr("type") == "email" && !emailValidation($(this).val())){
                valid = false;
                $(this).addClass('is-invalid')
            } else
                $(this).removeClass('is-invalid')
        }
    });
    $(".is-invalid").first().focus()

    $(".is-invalid").on('input change', function(){
        if ($(this).val()){
            $(this).removeClass('is-invalid')
        } else {
            $(this).addClass('is-invalid')
        }
    })
    return valid;
}


// Email Validation
function emailValidation(email){
    let emailPattern = /^[a-zA-Z0-9._%+-]+@hrms\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)){
        Notiflix.Notify.warning("Please enter a valid HRMS email address. eg. example@hrms.com")
        return false;
    }
    return true;
}


// Start Loader
function startLoader(){
    $("#dashboard").hide()
    $("#attendance-calenda").hide()
    $("#fullscreen-loader").show()
}


// Stop Loader
function stopLoader(page){
    $("#fullscreen-loader").hide();
    $("#" + page).show();
}


// =========================================== Event Listners ===========================================
// In Scope event listners for dynamic items
$(document).on('click', '.edit-employee', function(){
    let employee_id = $(this).data('id')
    getEmployeeDetails(employee_id)
})


// Navigation Link Event Listeners
$("#dashboard-link").click(function(){
    loadEmployees()
    $(".nav-link").removeClass("active")
    $(this).addClass("active")
    $("#attendance-calendar").hide()
    $("#dashboard").show()
});


// All employees tab navigation
$("#all-employees-tab").click(function(){
    $(".table-tab-btn").removeClass('active')
    $(this).addClass('active')
    $("#all-employees-body").show()
    $("#resigned-employees-body").hide()
})


// Resigned employees tab navigation
$("#resigned-employees-tab").click(function(){
    $(".table-tab-btn").removeClass('active')
    $(this).addClass('active')
    $("#all-employees-body").hide()
    $("#resigned-employees-body").show()
})


// Keyup event listener for search input to implement debounce
$(".search-filter").on("keyup", function(){
    clearTimeout(typingTimer);  // Reset timer on every keystroke
    let inputVal = $(this).val();

    typingTimer = setTimeout(function() {
        // When user stopped typing, call your function
        loadEmployees(inputVal, false);
    }, doneTypingInterval);
})


// Change event listener for search input to trigger search on dropdown change without waiting for debounce
$(".search-filter").on("change", function(){
    clearTimeout(typingTimer);  // Reset timer on every keystroke
    let inputVal = $(this).val();

    typingTimer = setTimeout(function() {
        // When user stopped typing, call your function
        loadEmployees(inputVal, false);
    }, doneTypingInterval);
})


// Event listener for attendance tracker link
$("#attendance-tracker-link").click(function(){
    $(".nav-link").removeClass("active")
    $(this).addClass("active")
    $("#dashboard").hide()
    $("#attendance-calendar").show()
    loadListViewAttendance()
});

$("#calendar-view").click(function(){
    $(this).addClass("active")
    $("#list-view").removeClass("active")
    $("#calendar").show()
    $("#list-view-container").hide()
    loadAttendanceCalendar()
})

$("#list-view").click(function(){
    $(this).addClass("active")
    $("#calendar-view").removeClass("active")
    $("#calendar").hide()
    $("#list-view-container").show()
    loadListViewAttendance()
})

$(document).on('change', '.date-filter', function(){
    const selectedDate = $(this).val()
    loadListViewAttendance(selectedDate)
})
