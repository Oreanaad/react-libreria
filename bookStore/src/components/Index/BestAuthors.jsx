import './BestAuthors.css';
import AuthorCard from './AuthorCard';
import { Link } from 'react-router-dom';


const BestAuthors= ({ authors }) => {
  if (!authors || authors.length === 0) {
    return <div className="no-books-message">No hay autores en esta sección.</div>;
  }


    return(
     <>
    
    <div className="author-list-grid">
      {authors.map((author) => (
        <AuthorCard key={author.id} author={author} />
       
      ))}
    </div>
    </>
    )
}

export default BestAuthors;