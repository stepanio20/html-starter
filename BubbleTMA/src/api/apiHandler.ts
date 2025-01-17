import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { useError } from '../app/errorContext'

const useApi = () => {
    const { setError } = useError();
    const baseURL = "https://apiv2.camelracing.io/";

    const api = axios.create({
        baseURL: baseURL,
    });

    api.interceptors.request.use(
        (config) => {
            const token = '123';
            config.headers['Authorization'] = `Bearer ${token}`;
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    api.interceptors.response.use(
        (response: AxiosResponse) => {
            return response;
        },
        (error) => {
            const status = error.response?.status;
            const errorMessage = error.message || 'An unexpected error occurred';

            if (status) {
                switch (status) {
                    case 400:
                        setError('Bad Request (400): Please check your input.');
                        break;
                    case 401:
                        setError('Unauthorized (401): Please log in again.');
                        break;
                    case 403:
                        setError('Forbidden (403): You do not have permission to perform this action.');
                        break;
                    case 404:
                        setError('Not Found (404): The requested resource could not be found.');
                        break;
                    case 422:
                        setError('Unprocessable Entity (422): Validation failed or invalid data provided.');
                        break;
                    default:
                        setError(`Error (${status}): ${errorMessage}`);
                }
            } else {
                setError(`Network Error: ${errorMessage}`);
            }

            setTimeout(() => setError(''), 3000);

            return Promise.reject(error);
        }
    );

    const request = async <T>(config: AxiosRequestConfig): Promise<{ data: T | null; status: number }> => {
        try {
            const response: AxiosResponse<T> = await api.request(config);
            return { data: response.data, status: response.status };
        } catch (error: any) {
            const message = error.response?.data || 'Oops, something went wrong';
            setError(message);
            setTimeout(() => {
                setError('');
            }, 2000);
            return { data: null, status: error.response?.status || 500 };
        }
    };

    return request;
};

export default useApi;
