import { chunkArray } from '../../helpers/format/format';
import {
  getRequest, postRequest, getOneDoctor, addDoctorApi, deleteDoctor,
} from '../../helpers/api/call';
import StorageManager from '../../helpers/format/StorageManager';
import { loginSuccess } from '../user/userActions';
import * as actions from './doctorActions';
// import { setUserData } from '../../helpers/format/userDataManager';

export const fetchAllDoctors = () => async (dispatch) => {
  try {
    dispatch(actions.loading(true));
    const response = await getRequest('doctors').then((data) => data.json());
    dispatch(actions.loadAllDoctors(response));
    const chunkedDoctors = chunkArray(response.data);
    dispatch(actions.loadChunkedDoctors(chunkedDoctors));
    dispatch(actions.loading(false));
  } catch (err) {
    dispatch(actions.apiErrors(true));
    throw new Error(err);
  }
};

export const fetchOneDoctor = (id) => async (dispatch) => {
  try {
    dispatch(actions.loading(true));
    const response = await getOneDoctor(id);
    dispatch(actions.loadOneDoctor(response));
    dispatch(actions.loading(false));
  } catch (err) {
    dispatch(actions.apiErrors(true));
    throw new Error(err);
  }
};

export const accountLogin = (data) => async (dispatch) => {
  let message = '';
  dispatch(actions.loading(true));
  await postRequest('users/login', data)
    .then((response) => response.json())
    .then((json) => {
      dispatch(actions.apiErrors(false));
      dispatch(actions.loading(false));
      if (!json.error) {
        StorageManager.setToken(json.token, json.exp);
        dispatch(loginSuccess(json.user_details));
        message = { message: 'Login successful, redirecting ...', status: true };
      } else {
        message = { message: json.error_message, status: false };
      }
    });
  return message;
};

export const setCurrentDoctorDispatcher = (id) => async (dispatch) => {
  const response = await getOneDoctor(id);
  if (!response.error) dispatch(actions.setCurrentDoctor(response));
};

export const addAppointmentDispatcher = (id, dateAppointment) => async (dispatch) => {
  const responseToJson = await (
    await postRequest('appointments', {
      doctor_id: id,
      date_of_appointment: dateAppointment,
    })
  ).json();

  if (responseToJson.error) {
    dispatch(actions.addAppointmentFailure(responseToJson.error_message));
  } else {
    dispatch(actions.addAppointment(responseToJson.data));
  }
};

export const addDoctorThunk = (data) => async (dispatch) => {
  let message = '';
  dispatch(actions.loading(true));
  await addDoctorApi('doctors', data)
    .then((response) => response.json())
    .then((json) => {
      dispatch(actions.apiErrors(false));
      dispatch(actions.loading(false));
      if (json.id) {
        dispatch(actions.addOneDoctor(json));
        message = { message: 'Doctor was created succesfully', status: true };
      } else {
        message = { message: 'Error in validations', status: false };
      }
    });
  return message;
};

export const deleteDoctorThunk = (id) => async (dispatch) => {
  let message = '';
  dispatch(actions.loading());
  await deleteDoctor(`doctors/${id}`)
    .then((response) => response.json())
    .then((json) => {
      dispatch(actions.loading());
      if (json.message) {
        dispatch(actions.deleteDoctor(id));
        message = { message: json.message, status: true };
      } else {
        message = { message: json.error, status: false };
      }
    });
  return message;
};