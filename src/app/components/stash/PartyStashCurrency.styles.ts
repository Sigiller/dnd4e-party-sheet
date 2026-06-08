import styled from "styled-components";

export const CurrencyBar = styled.div.attrs({ className: "party-stash-currency flexrow" })`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: ${({ theme }) => theme.spacingGutter};
  padding: 0.5rem ${({ theme }) => theme.spacingGutter};
  background: var(--background-row-odd, ${({ theme }) => theme.backgroundRowOdd});
  border-radius: ${({ theme }) => theme.radiusPanel};
  color: ${({ theme }) => theme.colourTextOnLight};
`;

export const CurrencyCells = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.65rem;
  flex: 1 1 auto;
  min-width: 0;
`;

export const CurrencyCell = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.25rem;
  white-space: nowrap;
  font-size: 0.9rem;
  font-weight: 600;

  i {
    font-size: 1rem;
    width: 1.1rem;
    text-align: center;
  }

  i.coin-cp {
    color: #8b5a2b;
  }
  i.coin-sp {
    color: #9ca3af;
  }
  i.coin-gp {
    color: #c9a227;
  }
  i.coin-pp {
    color: #6b7b8c;
  }
  i.coin-ad {
    color: #5eb8d4;
  }
  i.coin-rs {
    color: #9b6dd7;
  }

  .sep {
    opacity: 0.6;
    font-weight: 400;
  }
`;

export const CurrencyActions = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.25rem;
  flex: 0 0 auto;
`;

export const CurrencyButton = styled.button`
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-normal, #8b8b8b);
  border-radius: ${({ theme }) => theme.radiusControl};
  background: var(--background-other, #193d5e);
  color: #fff;
  cursor: pointer;

  &:hover:not(:disabled) {
    filter: brightness(1.15);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;
