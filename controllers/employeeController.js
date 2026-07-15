const employeeService = require("../services/employeeService");

exports.getEmployees = async (req, res) => {
  try {

    console.log("Logged User:", req.user); // 👈 from token
    
    const employees = await employeeService.getAllEmployees();

    res.json({
      status: true,
      message: "Employees fetched successfully",
      count: employees.length,
      employees,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

exports.getEmployeeByID = async (req, res) => {
  try {
    const id = req.params.id;

    // validation
    if (!id) {
      return res.status(400).json({
        status: false,
        message: 'Employee ID is required'
      });
    }

    const employee = await employeeService.getEmployeeByID(id);

    res.json({
      status: true,
      message: "Employee fetched successfully",
      employee: employee
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};
