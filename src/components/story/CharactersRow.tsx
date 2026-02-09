/**
 * CharactersRow - Displays character avatars
 * Used in Frame 52/53 (HORIZONTAL, 5px gap) and Frame 54 (10px gap)
 * Each avatar is 30px circle
 */
import styles from './CharactersRow.module.css';

interface Character {
  id: string;
  name: string;
  avatar?: string;
}

interface CharactersRowProps {
  characters: Character[];
}

export default function CharactersRow({ characters }: CharactersRowProps) {
  return (
    <>
      {characters.map((character) => (
        <div key={character.id} className={styles.avatar}>
          {character.avatar ? (
            <img src={character.avatar} alt={character.name} />
          ) : (
            <div className={styles.placeholder}>
              {character.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      ))}
    </>
  );
}
