import Swal from "sweetalert2";

export const successAlert = async (message) => {
  await Swal.fire({
    icon: "success",
    title: "Success",
    text: message,
    timer: 1000,
    showConfirmButton: false,
    theme: "dark",
  });
};

export const errorAlert = async (message) => {
  await Swal.fire({
    icon: "error",
    title: "Error",
    text: message,
    timer: 1000,
    showConfirmButton: false,
    theme: "dark",
  });
};
