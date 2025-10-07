import React from "react";
import styled, { css } from "styled-components";

interface SwitchProps {
  checked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  size?: "medium" | "small";
}

export const ToggleSwitch: React.FC<SwitchProps> = ({ checked = false, onChange, size = "medium" }) => {
   return (
    <StyledWrapper size={size}>
      <label className="switch">
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className="slider" />
      </label>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div<{ size: "medium" | "small" }>`
  .switch {
    position: relative;
    display: inline-block;
    cursor: pointer;
  }

  /* Hide default checkbox */
  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  /* Slider track */
  .slider {
    position: absolute;
    inset: 0;
    background: #d1d5db; /* Inactive state */
    border-radius: 9999px; /* fully rounded */
    transition: all 0.3s ease-in-out;
  }

  .slider:before {
    content: "";
    position: absolute;
    background-color: white;
    border-radius: 9999px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease-in-out;
  }

  /* Checked */
  .switch input:checked + .slider {
    background: #0974f1; /* Active state */
  }

  .switch input:checked + .slider:before {
    transform: translateX(100%);
  }

  /* === Medium size === */
  ${({ size }) =>
    size === "medium" &&
    css`
      .switch {
        width: 36px;
        height: 20px;
      }

      .slider:before {
        width: 20px;
        height: 20px;
        top: 0;
        left: 0;
      }
    `}

  /* === Small size === */
  ${({ size }) =>
    size === "small" &&
    css`
      .switch {
        width: 28px;
        height: 16px;
        padding: 0 0.5px; /* slight padding */
      }

      .slider:before {
        width: 16px;
        height: 16px;
        top: 0;
        left: 0;
      }
    `}
`;