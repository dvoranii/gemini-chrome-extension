import styled from 'styled-components';

export const ModalContainer = styled.div`
  width: 300px;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

export const Title = styled.h2`
  color: #202124;
  font-size: 18px;
  margin-bottom: 20px;
  font-weight: 500;
`;

export const InputLabel = styled.label`
  display: block;
  color: #5f6368;
  font-size: 14px;
  margin-bottom: 8px;
`;

export const InputField = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 20px;
  transition: border 0.3s;

  &:focus {
    outline: none;
    border-color: #4285f4;
    box-shadow: 0 0 0 2px #e8f0fe;
  }
`;

export const SaveButton = styled.button`
  width: 100%;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #3367d6;
  }

  &:active {
    background-color: #2a56c6;
  }
`;