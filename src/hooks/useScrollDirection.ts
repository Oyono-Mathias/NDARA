import { useState, useEffect } from 'react';

export function useScrollDirection(scrollContainerId: string = 'main-scroll-container') {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [prevOffset, setPrevOffset] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const scrollContainer = document.getElementById(scrollContainerId);
    if (!scrollContainer) return;

    const toggleScrollDirection = () => {
      let scrollY = scrollContainer.scrollTop;
      if (scrollY === 0) {
        setVisible(true);
        setScrollDirection('up');
        return;
      }
      
      if (scrollY > prevOffset && scrollY > 50) {
        setScrollDirection('down');
        setVisible(false);
      } else if (scrollY < prevOffset) {
        setScrollDirection('up');
        setVisible(true);
      }
      setPrevOffset(scrollY);
    };

    scrollContainer.addEventListener('scroll', toggleScrollDirection);
    return () => scrollContainer.removeEventListener('scroll', toggleScrollDirection);
  }, [prevOffset, scrollContainerId]);

  return { scrollDirection, visible };
}
